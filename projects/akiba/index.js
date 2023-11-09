const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, } = require('../helper/unknownTokens')

const Contracts = {
  kava: {
    wkava: ADDRESSES.kava.WKAVA,
    akiba: "0x8f5af8d2E06c976970752b5596BE05Cd518Adcdd",
    bank: "0x0CA1088C075E5C9447D5C07984aCCc48c816D01D", // Pool
    multiFeeDistribution: "0xa41045953C7fa32CCea9132997b2E7460db5ae3F", // Staking
    chef: "0x6b2349b0B2b2b9c1B970a1d0E5AB4226d6Cb78c8",
    lps: [
      "0xAd18F4d2087d954989d7b1f728AeE1941F7BC25F", // AKIBA_KAVA_LP
      "0xc75Bd803C2671fC4C0d7350C88e8250e9F7E9805", // KAVAX_KAVA_LP
    ]
  },
};

module.exports = {
  kava: {
    tvl: sumTokensExport({ owner: Contracts.kava.bank, tokens: [Contracts.kava.wkava, nullAddress] }),
    staking: sumTokensExport({ owner: Contracts.kava.multiFeeDistribution, tokens: [Contracts.kava.akiba], useDefaultCoreAssets: true, lps: Contracts.kava.lps}),
    pool2: sumTokensExport({ owner: Contracts.kava.chef, tokens: Contracts.kava.lps, useDefaultCoreAssets: true, lps: Contracts.kava.lps}),
  },
};
