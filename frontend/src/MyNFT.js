import React, { useEffect, useState } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";
import axios from "axios2";
import { ethers } from "ethers";

const MyNFT = ({ contract, contractAddress, auction, auctionAddress }) => {
  const [nfts, setNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferToWalletId, setTransferToWalletId] = useState("");
  const [transferNFT, setTransferNFT] = useState(null);
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const [approveToken, setApproveToken] = useState(false);
  const [minimumPrice, setMinimumPrice] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (!contract || !auction) return;

    fetchNFTs();
  }, [contract, auction]);

  const fetchNFTs = async () => {
    await contract;
    await auction;
    try {
      const ownerAddress = window.ethereum.selectedAddress;
      const tokenIds = await contract.getTokenIdsOfOwner(ownerAddress);
      console.log(tokenIds.toString());
      const fetchedNFTs = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const metadata = await fetchFromIPFS(tokenURI);
          console.log(metadata);
          return {
            tokenId: tokenId.toString(),
            metadata,
          };
        })
      );

      setNFTs(fetchedNFTs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
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

  const handleTransfer = async (tokenId) => {
    try {
      const signer = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const toAddress = prompt(
        "Enter the wallet address to transfer the NFT to:"
      );

      await contract.transferFrom(signer[0], toAddress, tokenId);
      console.log("NFT transferred successfully.");

      // Update the nfts state after the transfer
      const updatedNFTs = nfts.filter((nft) => nft.tokenId !== tokenId);
      setNFTs(updatedNFTs);
    } catch (error) {
      console.error("Error transferring NFT:", error);
    }
  };

  const handleConfirmTransfer = async () => {
    try {
      // Implement the transfer functionality here using the `transferToWalletId` value
      console.log("Transfer NFT with Token ID:", transferNFT.tokenId);
      console.log("Transfer to Wallet ID:", transferToWalletId);

      // Close the transfer modal
      setTransferModalOpen(false);
    } catch (error) {
      console.error("Error transferring NFT:", error);
    }
  };

  const handleAuction = (tokenId) => {
    setAuctionModalOpen(true);
    setApproveToken(false);
    setMinimumPrice("");
    setDuration("");
    setTransferNFT(tokenId);
  };

  const handleApproveToken = async () => {
    setApproveToken(true);
    try {
      await contract.approve(auctionAddress, transferNFT);
      console.log("Token approved for auction");
    } catch (error) {
      console.error("Error approving token:", error);
    }
  };
  
  const handleConfirmAuction = async () => {
    if (approveToken) {
      try {
        const signer = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
  
        await auction.list(
          contractAddress,
          transferNFT,
          minimumPrice,
          duration
        );
  
        console.log("Auction created successfully.");
  
        // Close the auction modal
        setAuctionModalOpen(false);
      } catch (error) {
        console.error("Error creating auction:", error);
      }
    } else {
      console.log("Token not approved");
    }
  };  

  const handleCloseTransferModal = () => {
    setTransferModalOpen(false);
  };

  const handleCloseAuctionModal = () => {
    setAuctionModalOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card-container">
      {nfts.map((nft) => (
        <Card key={nft.tokenId} className="mb-3" style={{ width: "300px" }}>
          <Card.Img
            variant="top"
            src={`https://gateway.pinata.cloud/ipfs/${nft.metadata.image}`}
            alt="NFT Image"
            style={{ height: "150px", objectFit: "cover" }}
          />
          <Card.Body>
            <Card.Title>
              Token ID: {nft.tokenId} - {nft.metadata.name}
            </Card.Title>
            <Card.Text>{nft.metadata.description}</Card.Text>
            <div className="d-flex justify-content-center">
              <Button
                variant="primary"
                className="mt-3"
                onClick={() => handleTransfer(nft.tokenId)}
              >
                Transfer
              </Button>
              <Button
                variant="primary"
                className="mt-3 ms-3" // Added 'ms-3' class for left margin
                onClick={() => handleAuction(nft.tokenId)}
              >
                Auction
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}

      {/* Transfer Modal */}
      <Modal show={transferModalOpen} onHide={handleCloseTransferModal}>
        <Modal.Header closeButton>
          <Modal.Title>Transfer NFT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="transferToWalletId">
            <Form.Label>Transfer to Wallet ID</Form.Label>
            <Form.Control
              type="text"
              value={transferToWalletId}
              onChange={(e) => setTransferToWalletId(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTransferModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmTransfer}>
            Confirm Transfer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Auction Modal */}
      <Modal show={auctionModalOpen} onHide={handleCloseAuctionModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create Auction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!approveToken && (
            <Button variant="primary" onClick={handleApproveToken}>
              Approve Token
            </Button>
          )}
          {approveToken && (
            <div>
              <Form.Group controlId="minimumPrice">
                <Form.Label>Minimum Price</Form.Label>
                <Form.Control
                  type="number"
                  value={minimumPrice}
                  onChange={(e) => setMinimumPrice(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="duration">
                <Form.Label>Duration (hours)</Form.Label>
                <Form.Control
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAuctionModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmAuction}>
            Create Auction
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyNFT;
