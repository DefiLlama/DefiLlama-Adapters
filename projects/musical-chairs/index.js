const { sumTokensExport } = require('../helper/unwrapLPs');

const contracts = {
  arbitrum: "0xEDA164585a5FF8c53c48907bD102A1B593bd17eF",
  ethereum: "0x7c01A2a7e9012A98760984F2715A4517AD2c549A",
  base: "0xEDA164585a5FF8c53c48907bD102A1B593bd17eF",
};

module.exports = {
  methodology: "TVL is calculated as the total ETH balance held in the MusicalChairsGame smart contract on each supported chain. This includes player stakes for active and pending games, as well as any accumulated but not yet withdrawn platform commissions.",
  arbitrum: {
    tvl: sumTokensExport({ owner: contracts.arbitrum }),
  },
  ethereum: {
    tvl: sumTokensExport({ owner: contracts.ethereum }),
  },
  base: {
    tvl: sumTokensExport({ owner: contracts.base }),
  },
};
