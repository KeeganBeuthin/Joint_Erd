// pages/block/[blockHash].js
'use client'
import BlockDetail from "../erd/BlockDetail";

export default function BlockPage({ params }) {
  const blockHash = params.blockHash;

  return (
    <BlockDetail blockHash={blockHash} />
  );
}
