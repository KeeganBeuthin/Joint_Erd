// BlockChain.js
import { useState } from "react";
import {
  Breadcrumb,
  Container,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
import BlockDetail from "./BlockDetail";
import TransactionDetail from "./TransactionDetail";

const BlockchainExplorer = () => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [viewState, setViewState] = useState({
    view: "blocks",
    selectedBlock: null,
    selectedTransaction: null,
  });

  const updateViewState = (view, block = null, transaction = null) => {
    setViewState({
      view,
      selectedBlock: block,
      selectedTransaction: transaction,
    });
  };

  const breadcrumbItems = [
    {
      label: "Blocks",
      onClick: () => updateViewState("blocks"),
      active: viewState.view === "blocks",
    },
    viewState.view !== "blocks" && {
      label: `Block ${viewState.selectedBlock?.height}`,
      onClick: () => updateViewState("blockDetail", viewState.selectedBlock),
      active: viewState.view === "blockDetail",
    },
    viewState.view === "transactionDetail" && {
      label: `Transaction ${viewState.selectedTransaction?.hash}`,
      active: true,
    },
  ].filter(Boolean);

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
      ],
      time: 1563043200,
      reward: "12.5",
      confirmations: 950,
    },
  ];

  return (
    <Container>
      <Breadcrumb>
        {breadcrumbItems.map((item, idx) => (
          <Breadcrumb.Item
            key={idx}
            active={item.active}
            onClick={item.onClick}
            style={{ cursor: "pointer" }}
          >
            {item.label}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>

      {viewState.view === "blocks" && (
        <ListGroup>
          {blocks.map((block) => (
            <ListGroupItem
              key={block.hash}
              action
              onClick={() => updateViewState("blockDetail", block)}
            >
              Block {block.height}
            </ListGroupItem>
          ))}
        </ListGroup>
      )}

      {viewState.view === "blockDetail" && viewState.selectedBlock && (
        <BlockDetail
          blockData={viewState.selectedBlock}
          selectTransaction={(tx) =>
            updateViewState("transactionDetail", viewState.selectedBlock, tx)
          }
        />
      )}

      {viewState.view === "transactionDetail" &&
        viewState.selectedTransaction && (
          <TransactionDetail txHash={viewState.selectedTransaction.hash} />
        )}
    </Container>
  );
};

export default BlockchainExplorer;
