const ethers = require("ethers");

const provider = new ethers.providers.Web3Provider(window.ethereum);

const abi = [
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
const auctionAbi = [
  "event Bid(address bidder, uint256 listingId, uint256 amount, uint256 timestamp)",
  "event List(address lister, address nft, uint256 nftId, uint256 listingId, uint256 minimumPrice, uint256 endTime, uint256 timestamp)",
  "function bid(uint256 listingId) payable",
  "function end(uint256 listingId)",
  "function getAuctionCount() view returns (uint256)",
  "function getHighestBidder(uint256 listingId) view returns (address)",
  "function getListing(uint256 listingId) view returns (address, uint256, uint256, uint256, uint256)",
  "function getListingOwner(uint256 listingId) view returns (address)",
  "function list(address nft, uint256 nftId, uint256 minPrice, uint256 numHours)",
  "function onERC721Received(address operator, address from, uint256 tokenId, bytes data) returns (bytes4)",
  "function withdrawFunds()",
];

const address = "0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5";
const auctionAddress = "0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d";

export const connect = async () => {
  await provider.send("eth_requestAccounts", []);
  return getContract();
};

export const getContract = async () => {
  const signer = provider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
  const auction = new ethers.Contract(auctionAddress, auctionAbi, signer);
  return { signer: signer, contract: contract, auction: auction };
};
