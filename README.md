# NFT Auction DApp

This decentralized application (DApp) allows users to create and participate in auctions for non-fungible tokens (NFTs). Users can list their NFTs for auction, specify the minimum price and auction duration, and other users can bid on the listed NFTs. The highest bidder at the end of the auction period wins the NFT.

## Features

- Mint an NFT: Users can create and mint their own NFTs by providing the name, description, and image.
- Transfer NFT: Users can transfer their NFTs to other wallet addresses.
- List NFTs for Auction: Users can list their NFTs for auction by providing the NFT, minimum price, and auction duration.
- Place Bids: Users can place bids on the listed NFTs by specifying the auction ID and the bid amount.
- Automatic Auction Ending: When the auction duration ends, the highest bidder is declared the winner, and the NFT is transferred to their address.
- Withdraw Funds: The auction owner can withdraw the highest bid amount after the auction ends.
- View Auction Details: Users can view the details of each auction, including the current highest bid, minimum price, auction end time, and the owner of the NFT.

## Technologies Used

- Solidity: The smart contract language used to implement the auction functionality.
- Hardhat: A development environment for Ethereum smart contracts, used for compiling, testing, and deploying the smart contract.
- Ethereum: The blockchain platform on which the DApp is deployed.
- OpenZeppelin: A library for secure smart contract development, used for the ERC721 token implementation and other contract functionalities.
- JavaScript: The programming language used for the frontend web application.
- React: A JavaScript library used for building the user interface of the DApp.
- Web3.js: A JavaScript library that interacts with the Ethereum blockchain, used for connecting the frontend with the smart contract.
- IPFS: InterPlanetary File System, used for storing and retrieving metadata associated with the NFTs.

## Getting Started

1. Clone the repository:
   git clone <repository-url>

2. Install the dependencies:
   npm install

3. Run the hardhat node:
   npx hardhat node

4. Deploy the contract:
   cd backend
   npx hardhat run --network localhost ./scripts/deploy.js

## Usage

1. Mint an NFT:

   - Click Mint NFT from navbar.
   - Input name, description, and image.
   - Click Mint NFT button.

2. Transfer NFT:

   - Click My NFT from navbar.
   - Click transfer from the NFT that you want to transfer.
   - Input receiver's wallet address.

3. List NFT for Auction:

   - Click My NFT from navbar.
   - Click Auction button on which NFT that you want to auction.
   - You must first approve the token by click the approve button.
   - Enter the minimum price, and auction duration.
   - Click "List" to create the auction.

4. Place a Bid:

   - Click Bid NFT from navbar.
   - Find the NFT auction you want to bid on.
   - Enter your bid amount.
   - Click "Place bid" to place your bid.

5. Auction Ending:

   - When the auction duration ends, the highest bidder is declared the winner, and the NFT is transferred to their address.
   - The auction owner can withdraw the highest bid amount after the auction ends.

6. View Auction Details:
   - Explore the listed auctions to view their details, including the current highest bid, minimum price, auction end time, and NFT owner.

## Contributing

Contributions are welcome! If you find any issues or want to enhance the functionality of the NFT Auction DApp, feel free to submit a pull request.
