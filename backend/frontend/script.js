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
  "function getTokenIdsOfOwner(address owner) view returns (uint256[])",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function mintToken(address owner, string metadataURI) returns (uint256)",
  "function name() view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function setTokenURI(uint256 tokenId, string metadataURI)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function transferFrom(address from, address to, uint256 tokenId)",
];

const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
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
  console.log(ownerAddress);

  const numNFTs = await tokenContract.balanceOf(ownerAddress);
  const tokenIds = await tokenContract.getTokenIdsOfOwner(ownerAddress);
  document.getElementById("numNfts").textContent = numNFTs;
  document.getElementById("nftIdOwned").textContent = tokenIds;
  const nftsContainer = document.getElementById("nfts");
  nftsContainer.innerHTML = "";

  const row = document.createElement("div");
  row.classList.add("row");

  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i];
    console.log("tokenid: ", tokenId.toNumber());
    const uri = await tokenContract.tokenURI(tokenId);
    const owner = await tokenContract.ownerOf(tokenId);

    const link = getUrl(uri);
    const response = await fetch(link);
    const json = await response.json();

    const col = document.createElement("div");
    col.classList.add("col");

    const card = document.createElement("div");
    card.classList.add("card");

    const img = document.createElement("img");
    img.src = getUrl(json.image);
    img.classList.add("card-img-top", "img-fluid");
    img.style.maxHeight = "200px";
    img.style.objectFit = "cover";
    card.appendChild(img);

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const tokenIdElement = document.createElement("p");
    tokenIdElement.classList.add("card-text");
    tokenIdElement.textContent = "Token ID: " + tokenId;
    cardBody.appendChild(tokenIdElement);

    const name = document.createElement("h5");
    name.classList.add("card-title");
    name.textContent = json.name;
    cardBody.appendChild(name);

    const description = document.createElement("p");
    description.classList.add("card-text");
    description.textContent = json.description;
    cardBody.appendChild(description);

    const ownerElement = document.createElement("p");
    ownerElement.classList.add("card-text");
    ownerElement.textContent = "Owner: " + owner;
    cardBody.appendChild(ownerElement);

    card.appendChild(cardBody);
    col.appendChild(card);
    row.appendChild(col);

    nftsContainer.appendChild(row);
  }
}

async function MintNFT() {
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

    // Transfer the NFT to the target address
    await tokenContract.transferFrom(signer.getAddress(), toAddress, tokenId);
    console.log("NFT transferred successfully");

    getAllNFTs(); // Update the displayed NFTs after the transfer
  } catch (error) {
    console.error("Error transferring NFT:", error);
  }
}

function getUrl(ipfs) {
  return "https://ipfs.io/ipfs/" + ipfs;
}

// async function getOwner() {
//   const tokenId = document.getElementById("tokenIdInput").value;

//   try {
//     await getAccess();
//     const owner = await tokenContract.ownerOf(tokenId);

//     console.log("Owner of Token ID", tokenId, ":", owner);
//   } catch (error) {
//     console.error("Error getting owner:", error);
//   }
// }
