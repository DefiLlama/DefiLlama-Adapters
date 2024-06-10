const aaveVaults = ["0x7100409baaeda121ab92f663e3ddb898f11ff745", "0x844Ccc93888CAeBbAd91332FCa1045e6926a084d"];

async function tvl(api) {
  const tokens = await api.multiCall({ abi: "address:asset", calls: aaveVaults });
  const aTokens = await api.multiCall({ abi: "address:aToken", calls: aaveVaults });
  const tokensAndOwners2 = [tokens.concat(aTokens), aaveVaults.concat(aaveVaults)];
  return api.sumTokens({ tokensAndOwners2 });
}

module.exports = {
  methodology: "Returns the total assets owned by the LazyOtter Vault on Scroll.",
  scroll: {
    tvl,
  },
};
