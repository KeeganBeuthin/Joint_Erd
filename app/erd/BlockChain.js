// BlockchainExplorer.js
import { useState } from 'react';
import { Container, ListGroup, ListGroupItem } from 'react-bootstrap';
import BlockDetail from './BlockDetail'; // Adjust the path as necessary

const BlockchainExplorer = () => {
  const [selectedBlock, setSelectedBlock] = useState(null);

  // Mock data for the blocks
  const blocks = [
    {
      hash: "000000000000000000076b86795cd772de07d73c40293636cbf3ce69c7c2e2c5",
      height: 580000,
      size: 1254336,
      transactions: [
        {
          hash: "79abf8f0d68f7d8225",
          amount: "0.5",
          date: 1562956800,
          fee: "0.0001",
        },
        // More mock transactions for this block...
      ],
      time: 1562956800,
      reward: "12.5",
      confirmations: 1000,
    },
    {
      hash: "000000000000000000087c86795cd772de07d73c40293636cbf3ce69c7c2e2d6",
      height: 580001,
      size: 1239811,
      transactions: [
        {
          hash: "88acf8f0d68f7d8226",
          amount: "0.8",
          date: 1563043200,
          fee: "0.0002",
        },
        // More mock transactions for this block...
      ],
      time: 1563043200,
      reward: "12.5",
      confirmations: 950,
    },
    // Add more mock blocks as necessary...
  ];

  return (
    <Container>
      <ListGroup>
        {blocks.map((block) => (
          <ListGroupItem
            key={block.hash}
            action
            onClick={() => setSelectedBlock(block)}
            style={{ cursor: 'pointer' }}
          >
            Block {block.height}
          </ListGroupItem>
        ))}
      </ListGroup>

      {/* Block Detail View */}
      {selectedBlock && (
        <BlockDetail blockData={selectedBlock} closeDetail={() => setSelectedBlock(null)} />
      )}
    </Container>
  );
};

export default BlockchainExplorer;
