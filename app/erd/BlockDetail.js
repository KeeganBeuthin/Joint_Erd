import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';

const BlockDetail = ({ blockHash }) => {
  const [blockDetails, setBlockDetails] = useState(null);


  const mockBlockDetails = {
    hash: blockHash,
    height: 840825,
    size: 1378393,
    time: 1618888888,
    reward: '3.125',
    transactions: [
      {
        hash: '79abf8f0...d8f7d8225',
        amount: '3.76055037',
        date: 1618888888,
        fee: '0.0005',
      },
      // More mock transactions...
    ],
    confirmations: 100,
    merkle_root: '89ee4a98bd1bcee5eea...',
  };

  useEffect(() => {
    // Fetch block details using the blockHash
    const fetchBlockDetails = async () => {
      setBlockDetails(mockBlockDetails);
    };

    fetchBlockDetails();
  }, [blockHash]);

  if (!blockDetails) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Row className="justify-content-md-center my-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Block {blockDetails.height}</Card.Title>
              <Card.Text>
                Hash: {blockDetails.hash}
                <br />
                Block Size: {blockDetails.size} bytes
                <br />
                Received Time: {new Date(blockDetails.time * 1000).toLocaleString()}
                <br />
                Rewards: {blockDetails.reward} BTC
                <br />
                Total Transactions: {blockDetails.transactions.length}
                <br />
                Confirmations: {blockDetails.confirmations}
                <br />
                Merkle Root: {blockDetails.merkle_root}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col md={10}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Hash</th>
                <th>Amount Transacted</th>
                <th>Date</th>
                <th>Tx Fee</th>
              </tr>
            </thead>
            <tbody>
              {blockDetails.transactions.map((tx, index) => (
                <tr key={index}>
                  <td>{tx.hash}</td>
                  <td>{tx.amount} BTC</td>
                  <td>{new Date(tx.date).toLocaleString()}</td>
                  <td>{tx.fee} BTC</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default BlockDetail;
