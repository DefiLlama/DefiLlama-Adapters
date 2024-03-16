const ADDRESSES = require('../helper/coreAssets.json');
const { nullAddress } = require('../helper/unwrapLPs');
const { sumTokensExport } = require('../helper/unwrapLPs');

// The Ethereum address you're interested in
const targetAddress = '0x849F4081899305A1Fd24aAC84db5174EB60DC28e';
const config = {
  ethereum: [
    {
      tokens: [
        ADDRESSES.ethereum.SDAI,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        nullAddress,
      ],
      holders: [targetAddress],
    },
  ],
  blast: [
    {
      tokens: [ADDRESSES.blast.USDB, nullAddress],
      holders: [targetAddress],
    },
  ],
};

module.exports = {};
Object.keys(config).forEach((chain) => {
  const tokensAndOwners = config[chain]
    .map(({ tokens, holders }) =>
      holders.map((o) => tokens.map((t) => [t, o])).flat(),
    )
    .flat();
  module.exports[chain] = {
    tvl: sumTokensExport({ tokensAndOwners }),
  };
});
