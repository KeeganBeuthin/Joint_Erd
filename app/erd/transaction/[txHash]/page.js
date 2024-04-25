// TransactionDetail.js
'use client'
// TransactionDetail.js
import React from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';

const TransactionDetail = ({ txHash }) => {
  // Mock data for the transaction
  const transaction = {
    txHash,
    amountTransacted: '3.76055037 BTC',
    from: 'coinbase',
    to: '1PujnFJ...DAXkkL4',
    fee: '0 BTC',
    confirmations: '57',
    date: '25/04/2024 - 13:12:06 UTC',
    includedInBlock: '840825',
    size: '310 bytes',
    status: 'Confirmed',
  };

  return (
    <Container>
      <Row>
        <Col>
          <Card className="my-4">
            <Card.Header as="h5">Transaction {transaction.txHash}</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>Amount Transacted: {transaction.amountTransacted}</ListGroup.Item>
              <ListGroup.Item>Fee: {transaction.fee}</ListGroup.Item>
              <ListGroup.Item>Date/Time: {transaction.date}</ListGroup.Item>
              <ListGroup.Item>Included in block: {transaction.includedInBlock}</ListGroup.Item>
              <ListGroup.Item>Size: {transaction.size}</ListGroup.Item>
              <ListGroup.Item>Confirmations: {transaction.confirmations}</ListGroup.Item>
              <ListGroup.Item>Status: {transaction.status}</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
      {/* More details can be added here as needed */}
    </Container>
  );
};

export default TransactionDetail;
