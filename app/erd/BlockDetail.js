// BlockDetail.js
import React from 'react';
import { Card, Table, Button } from 'react-bootstrap';

const BlockDetail = ({ blockData, selectTransaction }) => {
  return (
    <Card>
      <Card.Header>Block Details</Card.Header>
      <Card.Body>
        <Card.Title>Block {blockData.height}</Card.Title>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Transaction Hash</th>
              <th>Actions</th>
              {/* Other headings can be added here */}
            </tr>
          </thead>
          <tbody>
            {blockData.transactions.map((tx) => (
              <tr key={tx.hash}>
                <td>{tx.hash}</td>
                <td>
                  <Button variant="primary" onClick={() => selectTransaction(tx)}>
                    View Details
                  </Button>
                </td>
                {/* Other transaction details can be added here */}
              </tr>
            ))}
          </tbody>
        </Table>
        {/* You can add more block details here if needed */}
      </Card.Body>
    </Card>
  );
};

export default BlockDetail;
