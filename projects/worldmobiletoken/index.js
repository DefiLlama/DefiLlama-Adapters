const { sumTokensExport } = require("../helper/chain/cardano");

const scriptAddresses = [
  'addr1w82u502esm0zmv77t0csd6jrgr6wupy5zr7pdwdczpyerpgf6r666',
];

module.exports = {
  methodology: 'Counts amount of WMT locked; converted by the price of ADA sitting in the orderbook.',
  timetravel: false,
  cardano: {
    tvl: () => 0,
    staking: sumTokensExport({ scripts: scriptAddresses, })
  },
};
