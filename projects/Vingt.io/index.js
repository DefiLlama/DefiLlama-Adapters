const { sumTokens2 } = require('../helper/unwrapLPs');

const arbitrumLeverageTokens = [
  "0xe30d89E3B71270691d62c014BD64C756Fe318777", // eth2x
  "0x0E4DBc3f201f33876eC7b53495076eCA0fC26821", // eth3x
  "0xd6f1093f474bA300ad378239d743cA33EfDd8457", // ieth1x
  "0xddaaf04eE2c0ee8fb3Af961243b2912DD71825aD", // btc2x
  "0x360e50B2aF3af585CF9A14021bD55BbeAa6e603b", // btc3x
  "0x642db5e65287FCd25885D8fB68478F6e96933648", // ibtc1x
];

const bnbIndexTokens = [
  "0xaEE6C5823Fae8a25DcE797c0ade505983c1C08aE", // bsk
  "0x318a5139e93F3d519D100Fe69e115f211c3C80Fe", // plt
  "0xA2a078586DbC8bDf2BFB05C376c87695FFa6128F", // sit
];

const aaveV3LeverageModule = "0x05f14CE2e01e3b261852bA225561D10197E1e35f".toLowerCase();

const config = {
  arbitrum: {
    sets: arbitrumLeverageTokens,
    aaveLeverageModule: aaveV3LeverageModule,
  },
  bsc: {
    sets: bnbIndexTokens,
  },
};

Object.keys(config).forEach(chain => {
  const { sets, aaveLeverageModule, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {

      const tokens = await api.multiCall({ abi: 'address[]:getComponents', calls: sets })
      const modules = await api.multiCall({ abi: 'address[]:getModules', calls: sets, })

      const toa = []
      sets.forEach((o, i) => tokens[i].forEach(t => toa.push([t, o])))

      const aaveLeveragedSets = sets.filter((m, i) => modules[i].some(j => j.toLowerCase() === aaveLeverageModule))
      const auTokens = await api.multiCall({ abi: 'function getEnabledAssets(address) view returns (address[] uToken, address[] vToken)', calls: aaveLeveragedSets, target: aaveLeverageModule })
      const aTokenCalls = []
      const aTokenToSets = []
      auTokens.forEach((o, i) => {
        o.uToken.concat(o.vToken).forEach((u) => {
          aTokenCalls.push(u)
          aTokenToSets.push(aaveLeveragedSets[i])
        })
      })
      const aaveReceiptTokens = await api.multiCall({ abi: 'function underlyingToReserveTokens(address) view returns (address aToken, address variabeDebtToken)', calls: aTokenCalls, target: aaveLeverageModule })
      aaveReceiptTokens.forEach((o, i) => toa.push([o.variabeDebtToken, aTokenToSets[i]]))



      await sumTokens2({ api, tokensAndOwners: toa, blacklistedTokens: sets })
    },
  };
});
