import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Button } from "react-bootstrap";

const NavbarTop = ({ connect, connected, signerAddress }) => {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container fluid>
        <Navbar.Brand href="/">Animals</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link href="/myNFT">My NFT</Nav.Link>
            <Nav.Link href="/mintNFT">Mint NFT</Nav.Link>
            <Nav.Link href="/bidNFT">Bid NFT</Nav.Link>
          </Nav>
          {/* <Nav>
            <Button onClick={}>Withdraw Funds</Button>
          </Nav> */}
          <Nav>
            {!connected ? (
              <Button onClick={connect}>Connect to Metamask</Button>
            ) : (
              <p style={{ color: "white" }}>{signerAddress}</p>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarTop;
