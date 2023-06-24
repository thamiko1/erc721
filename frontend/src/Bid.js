import React, { useEffect, useState } from "react";
import { Card, Button } from "react-bootstrap";
import axios from "axios2";
import { ethers } from "ethers";

const Bid = ({ contract, auction }) => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contract || !auction) return;
    fetchAuctions();
  }, [contract, auction]);

  const fetchAuctions = async () => {
    await auction;
    await contract;
    try {
      const auctionCount = await auction.getAuctionCount();
      console.log(auctionCount.toNumber());
      const fetchedAuctions = [];

      let fetchedCount = 0;
      let i = 0;

      while (fetchedCount < auctionCount) {
        try {
          const exists = await auction.listingExists(i);
          if (!exists) {
            i++;
            continue;
          }
          const auctionData = await auction.getListing(i);
          console.log(auctionData.toString());
          const tokenId = auctionData[1].toString();
          const highestBid = auctionData[2].toString();
          const minPrice = auctionData[3].toString();
          const endTime = auctionData[4].toString();
          let highestBidder;
          if (highestBid == 0) highestBidder = "None";
          else highestBidder = await auction.getHighestBidder(i);
          const tokenURI = await contract.tokenURI(tokenId);
          const metadata = await fetchFromIPFS(tokenURI);
          //   console.log(metadata);

          // Convert Unix timestamp to human-readable format
          const endTimeInSeconds = parseInt(endTime, 10);
          const endTimeInMillis = endTimeInSeconds * 1000;
          const endTimeDate = new Date(endTimeInMillis);
          const endTimeString = endTimeDate.toLocaleString();
          //   console.log(endTime, Date.now())
          if (Date.now() > endTimeInMillis) {
            const gasLimit = 200000;
            await auction.end(i, { gasLimit });
            continue;
          }
          const owner = await auction.getListingOwner(i);
          const listing = {
            owner: owner,
            metadata,
            auctionId: i,
            tokenId,
            highestBid,
            highestBidder: highestBidder,
            minPrice: minPrice,
            endTime: endTimeString,
            bidAmount: "", 
            inputError: false, 
          };

          fetchedAuctions.push(listing);
          fetchedCount++;
        } catch (error) {
          // console.error(`Error fetching auction with ID ${i}:`, error);
        }

        i++;
      }

      setAuctions(fetchedAuctions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching auctions:", error);
    }
  };

  const fetchFromIPFS = async (ipfsURI) => {
    try {
      const response = await axios.get(
        `https://gateway.pinata.cloud/ipfs/${ipfsURI}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching from IPFS:", error);
    }
  };

  const handlePlaceBid = async (listingId, minimumPrice, listingIndex) => {
    const listing = auctions[listingIndex];
    const parsedMinimumPrice = ethers.utils.parseEther(minimumPrice);
    const parsedBidAmount = ethers.utils.parseEther(listing.bidAmount);

    if (
      parsedBidAmount.lte(parsedMinimumPrice) ||
      parsedBidAmount.lte(listing.highestBid)
    ) {
      const updatedAuctions = [...auctions];
      updatedAuctions[listingIndex].inputError = true;
      setAuctions(updatedAuctions);
      return;
    }

    try {
      const signer = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signerWithProvider = signer && provider.getSigner(signer[0]);
      const auctionContractWithSigner = auction.connect(signerWithProvider);

      await auctionContractWithSigner.bid(listingId, {
        value: parsedBidAmount,
      });

      const updatedAuctions = [...auctions];
      updatedAuctions[listingIndex].highestBidder = signer[0];
      updatedAuctions[listingIndex].bidAmount = ""; // Clear bid amount after bid
      setAuctions(updatedAuctions);

      console.log("Bid placed successfully for Listing ID:", listingId);
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  };

  const handleBidAmountChange = (event, listingIndex) => {
    const updatedAuctions = [...auctions];
    updatedAuctions[listingIndex].bidAmount = event.target.value;
    updatedAuctions[listingIndex].inputError = false;
    setAuctions(updatedAuctions);
  };

  const handleWithdrawFunds = async () => {
    await auction.withdrawFunds();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card-container">
      <Button variant="danger" onClick={() => handleWithdrawFunds()}>
        Withdraw All Lost Bids Funds
      </Button>
      {auctions.map((auction, index) => (
        <Card
          key={auction.auctionId}
          className="mb-3"
          style={{ width: "300px" }}
        >
          <Card.Img
            variant="top"
            src={`https://gateway.pinata.cloud/ipfs/${auction.metadata.image}`}
            alt="NFT Image"
            style={{ height: "150px", objectFit: "cover" }}
          />
          <Card.Body>
            <Card.Title>
              Auction ID: {auction.auctionId}
              {new Date() > new Date(auction.endTime) && " - Ended"}
            </Card.Title>
            <Card.Text>
              Owner Address: {auction.owner}
              <br />
              Token ID: {auction.tokenId}
              <br />
              Minimum Price: {auction.minPrice} Ether
              <br />
              Current Highest Bid:{" "}
              {ethers.utils.formatEther(auction.highestBid)} Ether
              <br />
              Current Highest Bidder: {auction.highestBidder || "None"}
              <br />
              End Time: {auction.endTime}
            </Card.Text>

            <div>
              <input
                type="number"
                placeholder="Enter bid amount in Ether"
                value={auction.bidAmount}
                onChange={(event) => handleBidAmountChange(event, index)}
                style={{
                  border: auction.inputError ? "2px solid red" : "none",
                }}
              />
              <Button
                variant="primary"
                className="mt-3"
                disabled={
                  new Date() > new Date(auction.endTime) || auction.inputError
                }
                onClick={() =>
                  handlePlaceBid(auction.auctionId, auction.minPrice, index)
                }
              >
                Place Bid
              </Button>
            </div>

            {auction.inputError && (
              <p style={{ color: "red" }}>
                Please enter an amount greater than the minimum price and the
                current highest bid.
              </p>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default Bid;
