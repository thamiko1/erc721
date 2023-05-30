const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;

const tokenAbi = [
  "constructor(string tokenName, string symbol)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function balanceOf(address owner) view returns (uint256)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function mintToken(address owner, string metadataURI) returns (uint256)",
  "function name() view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function symbol() view returns (string)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function transferFrom(address from, address to, uint256 tokenId)",
];

const tokenAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
let tokenContract = null;

async function getAccess() {
  if (tokenContract) return;
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
}

async function getAllNFTs() {
  await getAccess();
  const ownerAddress = await signer.getAddress();

  const numNFTs = await tokenContract.balanceOf(ownerAddress);
  document.getElementById("numNfts").textContent = numNFTs;

  const nfts = [];
  const promises = [];
  for (let idx = 0; idx < numNFTs; idx++) {
    const tokenId = await tokenContract.tokenByIndex(idx);
    const uri = await tokenContract.tokenURI(tokenId);
    nfts.push({ id: tokenId, uri: uri });
  }

  const nftsContainer = document.getElementById("nfts");
  nftsContainer.innerHTML = ""; // Clear previous NFTs

  const row = document.createElement("div");
  row.classList.add("row");

  for (const nft of nfts) {
    const link = getUrl(nft.uri);
    const promise = fetch(link)
      .then((response) => response.json())
      .then((json) => {
        const col = document.createElement("div");
        col.classList.add("col");

        const card = document.createElement("div");
        card.classList.add("card");

        const img = document.createElement("img");
        img.src = getUrl(json.image);
        img.classList.add("card-img-top", "img-fluid");
        img.style.maxHeight = "200px"; // Set max height for the image
        img.style.objectFit = "cover"; // Ensure the image fills the container
        card.appendChild(img);

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        const tokenId = document.createElement("p");
        tokenId.classList.add("card-text");
        tokenId.textContent = "Token ID: " + nft.id;
        cardBody.appendChild(tokenId);

        const name = document.createElement("h5");
        name.classList.add("card-title");
        name.textContent = json.name;
        cardBody.appendChild(name);

        const description = document.createElement("p");
        description.classList.add("card-text");
        description.textContent = json.description;
        cardBody.appendChild(description);

        card.appendChild(cardBody);
        col.appendChild(card);
        row.appendChild(col);
      });

    promises.push(promise);
  }

  await Promise.all(promises);
  nftsContainer.appendChild(row);
}


async function mintNFT() {
  await getAccess();

  const nftName = document.getElementById("nftName").value;
  const nftDescription = document.getElementById("nftDescription").value;

  // Upload the image to IPFS
  const imageURI = await uploadImageToIPFS();

  // Create the metadata for the NFT
  const metadata = {
    name: nftName,
    description: nftDescription,
    image: imageURI,
    // Add any additional metadata fields you want
  };

  // Upload the metadata to IPFS
  const metadataURI = await uploadToIPFS(metadata);

  // Mint the NFT
  const ownerAddress = await signer.getAddress();
  const tokenId = await tokenContract.mintToken(ownerAddress, metadataURI);

  console.log("NFT minted with Token ID:", tokenId);
}

async function uploadImageToIPFS() {
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
}

async function uploadToIPFS(data) {
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
}

async function transferNFT() {
  const tokenId = document.getElementById("transferTokenId").value;
  const toAddress = document.getElementById("transferToAddress").value;

  try {
    await getAccess();
    await tokenContract.transferFrom(signer.getAddress(), toAddress, tokenId);
    console.log("NFT transferred successfully");
  } catch (error) {
    console.error("Error transferring NFT:", error);
  }
}
function getUrl(ipfs) {
  return "https://ipfs.io/ipfs/" + ipfs;
}
