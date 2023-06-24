import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

const Home = () => {
  return (
    <Container className="mt-5">
      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>NFT Minting</Card.Title>
              <Card.Text>
                Easily create and mint your own unique NFTs on our platform.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>NFT Display</Card.Title>
              <Card.Text>
                Showcase your NFT collection and let others explore and admire
                your digital creations.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>NFT Auction</Card.Title>
              <Card.Text>
                Participate in exciting NFT auctions, bid on your favorite
                pieces, and discover unique artworks from talented creators.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
