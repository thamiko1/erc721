import React, { useEffect, useState } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";
import axios from "axios2";

const MyNFT = ({ contract }) => {
  const [nfts, setNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [transferToWalletId, setTransferToWalletId] = useState("");
  const [transferNFT, setTransferNFT] = useState(null);

  useEffect(() => {
    if (!contract) return;

    fetchNFTs();
  }, [contract]);

  const fetchNFTs = async () => {
    await contract
    try {
      const ownerAddress = window.ethereum.selectedAddress;
      const tokenIds = await contract.getTokenIdsOfOwner(ownerAddress);

      const fetchedNFTs = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const metadata = await fetchFromIPFS(tokenURI);
          console.log(metadata)
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
      const signer = await window.ethereum.request({ method: "eth_requestAccounts" });
      const toAddress = prompt("Enter the wallet address to transfer the NFT to:");
  
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
      setShowModal(false);
    } catch (error) {
      console.error("Error transferring NFT:", error);
    }
  };

  const handleCloseModal = () => {
    // Close the transfer modal
    setShowModal(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card-container">
      {nfts.map((nft) => (
        <Card key={nft.tokenId} className="mb-3" style={{ width: "200px" }}>
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
            <Button variant="primary" className="mt-3" onClick={() => handleTransfer(nft.tokenId)}>
              Transfer
            </Button>
          </Card.Body>
        </Card>
      ))}

      {/* Transfer Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmTransfer}>
            Confirm Transfer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyNFT;