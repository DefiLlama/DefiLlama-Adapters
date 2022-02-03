const sdk = require("@defillama/sdk");
const { compoundExports } = require("../helper/compound");
const { transformMetisAddress } = require("../helper/portedTokens");

const { tvl: agoraTvl, borrowed: agoraBorrowed } = compoundExports(
  "0x3fe29D7412aCDade27e21f55a65a7ddcCE23d9B3",
  "metis",
  "0xcFd482DcE13cA1d27834D381AF1b570E9E6C6810",
  "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
  transformMetisAddress(),
);

const { tvl: agoraPlusTvl, borrowed: agoraPlusBorrowed } = compoundExports(
  "0x92DcecEaF4c0fDA373899FEea00032E8E8Da58Da",
  "metis",
  "0xE85A1ae1A2A21135c49ADEd398D3FD5Ed032B28e",
  "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
  transformMetisAddress(),
  symbol => symbol.indexOf('appuffNetswap') > -1
);

module.exports = {
  timeTravel: true,
  incentivized: true,
  misrepresentedTokens: true,
  methodology: `As in Compound Finance, TVL counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are counted as "Borrowed" TVL and can be toggled towards the regular TVL.`,
  metis: {
    tvl: sdk.util.sumChainTvls([agoraTvl, agoraPlusTvl]),
    borrowed: sdk.util.sumChainTvls([agoraBorrowed, agoraPlusBorrowed]),
  },
};
