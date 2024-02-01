// The provided address should be the FujiERC1155 contract that returns
// totalSupply() for token `ids` indicated.
const ethereumContracts = {
  weth: [
    {
      name: "MainnetF1155Core_VaultsETH",
      address: "0x1Cf24e4eC41DA581bEe223E1affEBB62a5A95484",
      ids: [0, 2, 4],
    },
    {
      name: "MainnetF1155Fuse_VaultsETH",
      address: "0xa2d62f8b02225fbFA1cf8bF206C8106bDF4c692b",
      ids: [0, 2],
    },
  ],
};

module.exports = {
  ethereumContracts,
};
