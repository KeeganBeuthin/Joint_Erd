import { useState, useEffect } from 'react';
import { Table, Container, Row, Col, Card } from 'react-bootstrap';
import BlockDetail from './BlockDetail';
import { useRouter } from 'next/navigation';


const BlockchainHeader = ({ blockHeight, supply, marketCap, changeRates }) => {
  return (
    <Container className="my-4">
      <Row className="justify-content-md-center">
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Block Height</Card.Title>
              <Card.Text>{blockHeight}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Supply</Card.Title>
              <Card.Text>{supply}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Market Cap</Card.Title>
              <Card.Text>{marketCap}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        {/* ... include other cards for each change rate */}
      </Row>
    </Container>
  );
};

const BlockchainExplorer = () => {
    const [headerData, setHeaderData] = useState([])
    const [blocks, setBlocks] = useState([

      // Mock block data
      {
        hash: '000000000000000000076b86795cd772de07d73c40293636cbf3ce69c7c2e2c5',
        height: 840813,
        size: 123456,
        transactions: 2200,
        reward: '6.25',
        time: 1618888888,
      },
      {
        hash: '000000000000000000087c86795cd772de07d73c40293636cbf3ce69c7c2e2d6',
        height: 840814,
        size: 113456,
        transactions: 2100,
        reward: '6.25',
        time: 1618890000,
      },
      // Add more mock blocks as needed
    ]);

  useEffect(() => {
    // You would fetch and set the header data here, as well as the blocks
    // Simulating fetched data with placeholder values
    setHeaderData({
      blockHeight: '840813',
      supply: '19,690,000.00',
      marketCap: '1,250,027,936,475.94 USD',
      changeRates: {
        hourly: '-0.69%',
        daily: '-4.41%',
        weekly: '2.88%',
      },
    });
    // Fetch the blocks as before...
  }, []);


  const [selectedBlockHash, setSelectedBlockHash] = useState(null);

  const handleBlockClick = (hash) => {
    setSelectedBlockHash(hash);
    // In a real application, you might navigate to a new route
    // router.push(`/block/${hash}`);
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={12}>
          <Table striped bordered hover variant="dark" className="text-center">
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
              {blocks.map((block) => (
                <tr key={block.hash}>
                  <td>
                    <a href="#!" onClick={() => handleBlockClick(block.hash)}>
                      {block.hash}
                    </a>
                  </td>
                  <td>{block.height}</td>
                  <td>{block.size}</td>
                  <td>{block.transactions}</td>
                  <td>{block.reward} BTC</td>
                  <td>{new Date(block.time * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      {/* Display the BlockDetail component when a block hash is selected */}
      {selectedBlockHash && <BlockDetail blockHash={selectedBlockHash} />}
    </Container>
  );
};

export default BlockchainExplorer;
