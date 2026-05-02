const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Ink = [
  {
    name: "Sentora Advanced Yields USD",
    vault: "0x63D124cF1afC22F0CCEa376168200508d2A0868E",
    accountant: "0x8C9C454C51eCc717eA03eC03B904565f405DEAF7",
    teller: "0x50e951CB35aa8e36459436fB4515Bb8361Cac522",
    lens: "0x90983EBF38E981AE38f7Da9e71804380e316A396",
    startBlock: 29559921,
    baseAsset: ADDRESSES.ink.USDC,
  },
  {
    name: "Advanced Strategies USDC",
    vault: "0x9761DDF8e79930b334f1Be1BD93aBE3695061CcA",
    accountant: "0x427a3c091F09fa6212d177060bb7456Abf538b22",
    teller: "0x48639C1934F14Dc666Af663299294F9e863BDedB",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 29501466,
    baseAsset: ADDRESSES.ink.USDC,
  },
  {
    name: "Balanced Yield USDC",
    vault: "0xcaae49fb7f74cCFBE8A05E6104b01c097a78789f",
    accountant: "0x0C4dF79d9e35E5C4876BC1aE4663E834312DDc67",
    teller: "0xC151E263d5c890FD0Bceb33a6525F1A76a8329fC",
    lens: "0x90983EBF38E981AE38f7Da9e71804380e316A396",
    startBlock: 29483710,
    baseAsset: ADDRESSES.ink.USDC,
  },
  {
    name: "Boosted Yield USDC",
    vault: "0xDbD87325D7b1189Dcc9255c4926076fF4a96A271",
    accountant: "0x9c2477D4Ea17d3cCC45e6b1087c94d14926F54C9",
    teller: "0xc46f2443b3521632E2E2a903D6da8f965B46f6a0",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 29554306,
    baseAsset: ADDRESSES.ink.USDC,
  },
];

module.exports = {
  boringVaultsV0Ink,
};
