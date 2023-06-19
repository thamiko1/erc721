import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./Home";
import { useState, useEffect } from "react";
import { connect, getContract } from "./contract";
import MintNFT from "./MintNFT";
import MyNFT from "./MyNFT";

function App() {
  const [connected, setConnected] = useState(false);
  const [contract, setContract] = useState(false);
  const [signerAddress, setSignerAddress] = useState(false);

  useEffect(() => {
    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) {
        handleInit();
      } else setConnected(false);
    });
  }, []);
  const handleInit = async () => {
    setConnected(true);
    const { contract, signer } = await getContract();
    setContract(contract);

    const address = window.ethereum.selectedAddress;
    setSignerAddress(address);
  };

  const connectCallback = async () => {
    const { contract } = await connect();
    setContract(contract);
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
          element={<MintNFT contract={contract}/>}
          
        ></Route>
        <Route path="/myNFT" element={<MyNFT contract={contract}/>}></Route>
      </Routes>
    </Router>
  );
}
export default App;
