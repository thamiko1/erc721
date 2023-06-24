// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs/promises");
const { ethers } = require("hardhat");
const { write } = require("fs");

async function main() {
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy("ANIMAL", "ANM");

  const Auction = await hre.ethers.getContractFactory("Auction");
  const auction = await Auction.deploy();

  await nft.deployed();
  await auction.deployed();

  await writeDeploymentInfo(nft, "nft-deployment.json");
  await writeDeploymentInfo(auction, "auction.json");
}

async function writeDeploymentInfo(contract, filename = "") {
  const data = {
    network: hre.network.name,
    contract: {
      address: contract.address,
      signerAdderss: contract.signer.address,
      abi: contract.interface.format(),
    },
  };
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filename, content, { encoding: "utf-8" });
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
