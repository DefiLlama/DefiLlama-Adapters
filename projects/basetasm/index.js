const ADDRESSES = require('../helper/coreAssets.json')
const Abis = require("./abi.json");
const { sumTokensExport, sumUnknownTokens, } = require('../helper/unknownTokens')

const Contracts = {
  base: {
    weth: ADDRESSES.base.WETH,
    xeth: "0x076944DD8Fb44DDd68231Ad41F82A603a9F7dcB8",
    elz: "0x1fBCCF8AfE9e58052F64E2E6790a65D2eb3f4765",
    bank: "0x4b9253B45F90b1a6766312cC0A3560c065496a35",
    multiFeeDistribution: "0xB89c125b433b854390Fddb22E8a1bDA4281e2946",
    chef: "0x373B887bfeE09F5fA721D5b1e8abfaFe067f41BC",
    lps: [
      "0x07641fd10Bf3Efcd88C346967b4A0274ed75Dadf", // ELZ_ETH_LP
      "0x3602F60FFDE7A18C6C93F813492888F05DF7de7A", // XETH_ETH_LP
      "0xA9D108B5B56AF60d72cA14bBc34a068e42c77ccB", // ELZ_XETH_LP
    ],
  },
};

async function calcBaseStakingTvl(api) {
  const baseStakingData = await api.call({ target: Contracts.base.multiFeeDistribution, abi: Abis.multiFeeDistribution.totalSupply, });
  api.add(Contracts.base.elz, baseStakingData)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, lps: Contracts.base.lps, })
}

module.exports = {
  base: {
    tvl: 
      sumTokensExport({ 
        owner: Contracts.base.bank, 
        tokens: [Contracts.base.weth] 
      }),
    pool2: 
      sumTokensExport({ 
        owner: Contracts.base.chef, 
        tokens: Contracts.base.lps, 
        useDefaultCoreAssets: true, 
      }),
    staking: calcBaseStakingTvl,
  },
};