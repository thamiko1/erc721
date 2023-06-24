import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./Home";
import { useState, useEffect } from "react";
import { connect, getContract } from "./contract";
import MintNFT from "./MintNFT";
import MyNFT from "./MyNFT";
import Bid from "./Bid";

function App() {
  const [connected, setConnected] = useState(false);
  const [contract, setContract] = useState(false);
  const [signerAddress, setSignerAddress] = useState(false);
  const [auction, setAuction] = useState(null);
  const [auctionAddress, setAuctionAddress] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);

  useEffect(() => {
    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) {
        handleInit();
      } else setConnected(false);
    });
  }, []);
  const handleInit = async () => {
    setConnected(true);
    const { contract, auction } = await getContract();
    setContract(contract);
    setAuction(auction);

    const address = window.ethereum.selectedAddress;
    setSignerAddress(address);
    const contractAddress = contract.address;
    setContractAddress(contractAddress);
    const auctionAddress = auction.address; // Get the auction address
    setAuctionAddress(auctionAddress);
  };

  const connectCallback = async () => {
    const { contract, auction } = await connect();
    setContract(contract);
    setAuction(auction);
    if (contract) {
      setConnected(true);
    }
  };
  return (
    <Router>
      <Navbar
        connect={connectCallback}
        connected={connected}
        signerAddress={signerAddress}
      />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route
          path="/mintNFT"
          element={<MintNFT contract={contract} />}
        ></Route>
        <Route
          path="/myNFT"
          element={
            <MyNFT
              contract={contract}
              contractAddress={contractAddress}
              auction={auction}
              auctionAddress={auctionAddress}
            />
          }
        ></Route>
        <Route
          path="/bidNFT"
          element={<Bid contract={contract} auction={auction} />}
        ></Route>
      </Routes>
    </Router>
  );
}
export default App;
