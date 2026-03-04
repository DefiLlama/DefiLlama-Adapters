const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = [
  {
    holder: "0x5b46A20284366F5e79D9B3e5e2FA0F5702b8C72F", // wmcUSD
    tokenAddress: ADDRESSES.celo.mcUSD, // mcUSD
  },
  {
    holder: "0xD96A74081440C28E9a3c09a3256D6e0454c52E41", // wmcUSD 2
    tokenAddress: ADDRESSES.celo.mcUSD, // mcUSD
  },
  {
    holder: "0xd3D7831D502Ab85319E1F0A18109aa9aBEBC2603", // wmCELO
    tokenAddress: ADDRESSES.celo.mCELO, // mCELO
  },
  {
    holder: "0x337ddAD7Fcb34E93a54a7B6df7C8Bae00fA91D09", // wmCELO 2
    tokenAddress: ADDRESSES.celo.mCELO, // mCELO
  },
  {
    holder: "0xb7e4e9329DA677969376cc76e87938563B07Ac6A", // wmcEUR
    tokenAddress: ADDRESSES.celo.mCEUR, // mcEUR
  },
  {
    holder: "0xAb32a0b6d427ce11a4cEf7Be174A3F291a2753E6", // wmcEUR 2
    tokenAddress: ADDRESSES.celo.mCEUR, // mcEUR
  },
];

module.exports = {
  methodology:
    "Poof uses wrapped Moola tokens to hold user balances. Calculate how many Moola tokens are in each of these wrapped tokens.",
  celo: { tvl: sumTokensExport({ tokensAndOwners: tokens.map(t => [t.tokenAddress, t.holder]) }) },
};
