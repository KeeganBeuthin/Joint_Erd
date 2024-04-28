// TransactionDetail.js
import { Card, Button } from "react-bootstrap";

const TransactionDetail = ({ txHash, closeDetail }) => {
  const transactionDetails = {
    amount: "0.001 BTC",
    from: "coinbase",
    to: "address",
    fee: "0.0001 BTC",
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
