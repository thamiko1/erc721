import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import axios from "axios2";

const MintNFT = ({ contract }) => {
  const [nftName, setNFTName] = useState("");
  const [nftDescription, setNFTDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const mintNFT = async () => {
    if (!contract) {
      alert("Please connect to Metamask.");
      return;
    }
    try {
      setLoading(true);
      // Upload the image to IPFS
      const imageURI = await uploadImageToIPFS();

      // Create the metadata for the NFT
      const metadata = {
        name: nftName,
        description: nftDescription,
        image: imageURI,
      };

      // Upload the metadata to IPFS
      const metadataURI = await uploadToIPFS(metadata);

      // Mint the NFT
      const ownerAddress = window.ethereum.selectedAddress;
      const tokenId = await contract.mintToken(ownerAddress, metadataURI);

      console.log("NFT minted with Token ID:", tokenId);
    } catch (error) {
      console.error("Error minting NFT:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToIPFS = async () => {
    const fileInput = document.getElementById("imageUpload");
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: "36b8acddb09b6a6ce00c",
          pinata_secret_api_key:
            "cfc8fc3e202d5ff7dc07cbd95edd92fc5cd41c8bfb5b324f311f0d58fbeb8aa9",
        },
      }
    );

    return response.data.IpfsHash;
  };

  const uploadToIPFS = async (data) => {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      {
        headers: {
          pinata_api_key: "36b8acddb09b6a6ce00c",
          pinata_secret_api_key:
            "cfc8fc3e202d5ff7dc07cbd95edd92fc5cd41c8bfb5b324f311f0d58fbeb8aa9",
        },
      }
    );

    return response.data.IpfsHash;
  };

  return (
    <div>
      <Form.Group controlId="nftName" className="m-2">
        <Form.Label>NFT Name</Form.Label>
        <Form.Control
          type="text"
          value={nftName}
          onChange={(e) => setNFTName(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="nftDescription" className="m-2">
        <Form.Label>NFT Description</Form.Label>
        <Form.Control
          type="text"
          value={nftDescription}
          onChange={(e) => setNFTDescription(e.target.value)}
        />
      </Form.Group>

      {
        <Form.Group controlId="imageUpload" className="m-2">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control type="file" accept="image/*" />
        </Form.Group>
      }

      <Button
        className="m-2 mt-4"
        variant="primary"
        onClick={mintNFT}
        disabled={loading}
      >
        {loading ? "Minting..." : "Mint NFT"}
      </Button>
    </div>
  );
};

export default MintNFT;
