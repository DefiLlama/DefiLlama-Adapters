const { sumUnknownTokens } = require("../helper/unknownTokens");

function vaultTvl(vaults) {
  return async (_, _b, _cb, { api }) => {
    const [tokens, bals] = await Promise.all([
      api.multiCall({ abi: "address:totalMargins", calls: vaults }),
    ]);
    api.addTokens(tokens, bals);
    return sumUnknownTokens({
      api,
      tokensAndOwners: ["0xA346963be84a215bce16FEd8Aac0e24eca74b25E"],
      useDefaultCoreAssets: true,
      lps: [],
      resolveLP: true,
    });
  };
}

module.exports = {
  arbitrum: {
    tvl: vaultTvl([
      "0x1c2D10633C78A47786759715d4618296D85D7cD1",
    ])
  },
  bsc: {
    tvl: vaultTvl([
      "0x88A72cb97E89b9B4bBfAaE90F123f176C59F1Bbc",
    ])
  },
  core: {
    tvl: vaultTvl([
      "0x93614e83C2d2874616B60B550215637eE84c5eAB",
    ])
  },
  polygon: {
    tvl: vaultTvl([
      "0x50b9D4a006254D330AaA0f264D2739A3f3a7D8E1",
    ])
  },
};
