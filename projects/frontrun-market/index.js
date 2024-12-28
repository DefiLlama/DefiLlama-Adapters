const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const targetAddress = '0x849F4081899305A1Fd24aAC84db5174EB60DC28e';
const config = {
  ethereum: {
    tokens: [
      ADDRESSES.ethereum.SDAI,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.null,
    ],
  },
  blast: {
    tokens: [ADDRESSES.blast.USDB, ADDRESSES.null,],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: targetAddress, tokens: config[chain].tokens }),
  };
});
