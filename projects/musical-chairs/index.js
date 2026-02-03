const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const contracts = {
  arbitrum: "0xEDA164585a5FF8c53c48907bD102A1B593bd17eF",
  ethereum: "0x7c01A2a7e9012A98760984F2715A4517AD2c549A",
  base: "0xEDA164585a5FF8c53c48907bD102A1B593bd17eF",
};

module.exports = {
  methodology: "TVL is calculated as the total ETH balance held in the MusicalChairsGame smart contract, representing active player stakes in current and pending games. Protocol-owned commissions are intended to be excluded.",
  arbitrum: {
    tvl: sumTokensExport({ owner: contracts.arbitrum, tokens: [ADDRESSES.null] }),
  },
  ethereum: {
    tvl: sumTokensExport({ owner: contracts.ethereum, tokens: [ADDRESSES.null] }),
  },
  base: {
    tvl: sumTokensExport({ owner: contracts.base, tokens: [ADDRESSES.null] }),
  },
};
