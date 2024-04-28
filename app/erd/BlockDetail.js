// BlockDetail.js
import { useState } from 'react';
import { Card, Table, Button } from 'react-bootstrap';
import TransactionDetail from './TransactionDetail'; // Adjust the path as necessary

const BlockDetail = ({ blockData, closeDetail }) => {
  const [selectedTxHash, setSelectedTxHash] = useState(null);

  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Block {blockData.height}</Card.Title>
          <Button variant="secondary" onClick={closeDetail}>
            Close Block Detail
          </Button>
          {/* Other block details */}
        </Card.Body>
      </Card>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Transaction Hash</th>
            <th>Actions</th>
            {/* Other headings */}
          </tr>
        </thead>
        <tbody>
          {blockData.transactions.map((tx) => (
            <tr key={tx.hash}>
              <td>{tx.hash}</td>
              <td>
                <Button variant="primary" onClick={() => setSelectedTxHash(tx.hash)}>
                  View Details
                </Button>
              </td>
              {/* Other transaction details */}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Transaction Detail Component */}
      {selectedTxHash && (
        <TransactionDetail txHash={selectedTxHash} closeDetail={() => setSelectedTxHash(null)} />
      )}
    </>
  );
};

export default BlockDetail;
