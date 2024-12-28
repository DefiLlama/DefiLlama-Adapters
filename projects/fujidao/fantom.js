// The provided address should be the FujiERC1155 contract that returns
// totalSupply() for token `ids` indicated.
const fantomContracts = {
  fantom: [
    {
      name: "FantomF1155Core_VaultsFTM",
      address: "0xB4E2eC87f8E6E166929A900Ed433c4589d721D70",
      ids: [0, 2],
    },
  ],
  wbtc: [
    {
      name: "FantomF1155Core_VaultsWBTC",
      address: "0xB4E2eC87f8E6E166929A900Ed433c4589d721D70",
      ids: [4],
    },
  ],
  weth: [
    {
      name: "FantomF1155Core_VaultsWETH",
      address: "0xB4E2eC87f8E6E166929A900Ed433c4589d721D70",
      ids: [6,8],
    },
  ],
};

module.exports = {
  fantomContracts,
};
