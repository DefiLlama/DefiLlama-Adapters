// The provided address should be the FujiERC1155 contract that returns
// totalSupply() for token `ids` indicated.
const arbitrumContracts = {
  weth: [{
    name: "ArbitrumF1155Core_VaultsWETH",
    address: "0x3E57e261F1420f11688783534dd4a462a6B63bbc",
    ids: [0, 2],
  }],
  usdc: [{
    name: "ArbitrumF1155Core_VaultsUSDC",
    address: "0x3E57e261F1420f11688783534dd4a462a6B63bbc",
    ids: [4],
  }],
};

module.exports = {
  arbitrumContracts,
};