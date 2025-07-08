// The provided address should be the FujiERC1155 contract that returns
// totalSupply() for token `ids` indicated.
const polygonContracts = {
  matic: [{
    name: "PolygonF1155Core_VaultsMATIC",
    address: "0x03BD587Fe413D59A20F32Fc75f31bDE1dD1CD6c9",
    ids: [0, 2],
  }],
  wbtc: [{
    name: "PolygonF1155Core_VaultsWBTC",
    address: "0x03BD587Fe413D59A20F32Fc75f31bDE1dD1CD6c9",
    ids: [4, 6],
  }],
  weth: [{
    name: "PolygonF1155Core_VaultsWETH",
    address: "0x03BD587Fe413D59A20F32Fc75f31bDE1dD1CD6c9",
    ids: [8, 10],
  }],
  usdc: [{
    name: "PolygonF1155Core_VaultsUSDC",
    address: "0x03BD587Fe413D59A20F32Fc75f31bDE1dD1CD6c9",
    ids: [16, 18],
  }],
};

module.exports = {
  polygonContracts,
};
