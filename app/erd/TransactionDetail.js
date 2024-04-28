// TransactionDetail.js
import { Card, Button } from 'react-bootstrap';

const TransactionDetail = ({ txHash, closeDetail }) => {
  // Replace the following with the transaction details retrieval
  const transactionDetails = {
    // Mock transaction details based on txHash
    amount: "0.001 BTC",
    from: "coinbase",
    to: "address",
    fee: "0.0001 BTC",
    // ... other details
  };

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Transaction {txHash}</Card.Title>
        {/* Render transaction details here using transactionDetails */}
        <Button variant="secondary" onClick={closeDetail}>
          Close Transaction Detail
        </Button>
      </Card.Body>
    </Card>
  );
};

export default TransactionDetail;
