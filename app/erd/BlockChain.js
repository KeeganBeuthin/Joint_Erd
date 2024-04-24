import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Table } from 'react-bootstrap';
import axios from 'axios';

const BlockchainExplorer = () => {
  const [marketData, setMarketData] = useState({});
  const [latestBlocks, setLatestBlocks] = useState([]);

  useEffect(() => {
    // Fetch market data
    const fetchMarketData = async () => {
      try {
        const response = await axios.get('YOUR_API_ENDPOINT/market-data');
        setMarketData(response.data);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    // Fetch latest blocks
    const fetchLatestBlocks = async () => {
      try {
        const response = await axios.get('YOUR_API_ENDPOINT/latest-blocks');
        setLatestBlocks(response.data.blocks);
      } catch (error) {
        console.error('Error fetching latest blocks:', error);
      }
    };

    fetchMarketData();
    fetchLatestBlocks();
  }, []);

  return (
    <Container fluid className="bg-dark text-white">
      <Row className="justify-content-md-center">
        <Col>
          <h1 className="text-center">Blockchain Explorer</h1>
          <Row>
            {/* Market Data */}
            <Col md={4}>
              <Card className="mb-4">
                <Card.Header>Market Data</Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>Price: ${marketData.price} USD</ListGroup.Item>
                  <ListGroup.Item>Difficulty: {marketData.difficulty}</ListGroup.Item>
                  <ListGroup.Item>Block Height: {marketData.blockHeight}</ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>

            {/* Latest Blocks */}
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>Latest Blocks</Card.Header>
                <Table striped bordered hover variant="dark">
                  <thead>
                    <tr>
                      <th>Hash</th>
                      <th>Block Height</th>
                      <th>Block Size (bytes)</th>
                      <th>Transactions</th>
                      <th>Block Reward</th>
                      <th>Mined Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestBlocks.map(block => (
                      <tr key={block.hash}>
                        <td>{block.hash}</td>
                        <td>{block.height}</td>
                        <td>{block.size}</td>
                        <td>{block.transactions}</td>
                        <td>{block.reward}</td>
                        <td>{block.minedTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default BlockchainExplorer;
