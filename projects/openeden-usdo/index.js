const ADDRESSES = require('../helper/coreAssets.json');
const { addRippleTokenBalance } = require('../helper/sumTokens');
const { sumTokensExport, sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  arbitrum: {
    owners: [
      "0x5EaFF7af80488033Bc845709806D5Fae5291eB88",
      "0x5E6c2AD8376A9E5E857B1d91643399E9aB65ff8c",
      "0xaAb4Ea02e5616787931c9E8283cb27F0211DC116",
      "0x7cb1dc5923aef8ae1aa8e8911b94d0732dde15fd",
    ],
    tokens: [
      "0xF84D28A8D28292842dD73D1c5F99476A80b6666A", //t-bill
    ],
  },
  ethereum: {
    owners: [
      "0x5EaFF7af80488033Bc845709806D5Fae5291eB88",
      "0x5E6c2AD8376A9E5E857B1d91643399E9aB65ff8c",
      "0x5bf369282fc12d773b06c6cdd574ccedab0c642c",
      "0x602a1cb1f821a3e8f507a7637a4be7af19578f75",
    ],
    tokens: [
      "0xdd50C053C096CB04A3e3362E2b622529EC5f2e8a",
      ADDRESSES.ethereum.USDC,
      "0x7712c34205737192402172409a8F7ccef8aA2AEc",
      "0x2255718832bC9fD3bE1CaF75084F4803DA14FF01",
      "0x136471a34f6ef19fE571EFFC1CA711fdb8E49f2b",
      "0x3DDc84940Ab509C11B20B76B466933f40b750dc9",
    ],
  },
  base: {
    owners: ["0x5EaFF7af80488033Bc845709806D5Fae5291eB88"],
    tokens: [ADDRESSES.base.USDC],
  },
  polygon: {
    owners: [
      "0x895e873498134d2ce2ab118633e164c044bc7b43",
      "0x591226f73844b1c20735496a7aa1a8ad2818e0b9",
      "0x5EaFF7af80488033Bc845709806D5Fae5291eB88",
    ],
    tokens: [
      "0x2893ef551b6dd69f661ac00f11d93e5dc5dc0e99",
    ],
  },
  bsc: {
    owners: ["0x5eaff7af80488033bc845709806d5fae5291eb88"],
    tokens: [ADDRESSES.bsc.USDC],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain] }),
  };
});

module.exports.ripple = {
  tvl: async (api) => {
    await addRippleTokenBalance({ api, account: 'rEsMDrPYTDRqCCYMiEuHpCHbq1c4tzkffZ', whitelistedTokens: ['TBL.rJNE2NNz83GJYtWVLwMvchDWEon3huWnFn']})
    return sumTokens2({ api })
  }
}

module.exports.methodology =
  "Counts TBILL, USDC, BUIDL and BENJI tokens held in the USDO system wallet on Ethereum, Arbitrum and Base.";
