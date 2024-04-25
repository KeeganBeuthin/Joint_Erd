// pages/block/[blockHash].js
'use client'
import BlockDetail from "../BlockDetail";

export default function BlockPage({ params }) {
  const blockHash = params.blockHash;

  return (
    <BlockDetail blockHash={blockHash} />
  );
}
