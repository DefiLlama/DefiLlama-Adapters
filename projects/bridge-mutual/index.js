const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  ethereum: {
    CapitalPool: "0x426f72ab027da5f5a462d377a5eb057f63082b02",
    staking: ["0x81d73999fabec7e8355d76d1010afbe3068f08fa", "0x55978a6f6a4cfa00d5a8b442e93e42c025d0890c"],
    PolicyBookRegistry: "0xff13c3d2c7931e86e13c993a8cb02d68848f9613",
    ShieldMining: "0x6d6fCf279a63129797def89dBA82a65b3386497e",
    usdt: ADDRESSES.ethereum.USDT,
    bmi: "0x725c263e32c72ddc3a19bea12c5a0479a81ee688",
  },
  bsc: {
    CapitalPool: "0x7fe3b7d89a982b3821d8fa2c93a1b87f87f00e80",
    staking: ["0x8be37f9bb9b09cf89774c103c52d1e660398a7b3"],
    PolicyBookRegistry: "0xab7c7356f706954c3c926a690e96c7b65fa76116",
    ShieldMining: "0xcc75bf59969e8362d064536fd941a541f81abe56",
    usdt: ADDRESSES.bsc.USDT,
    bmi: "0xb371f0eb8dfb3b47fdfc23bbcbc797954d3d4f23",
  },
  polygon: {
    CapitalPool: "0xb7594fc3e0a044b4aeeb910c3258ed24f3114006",
    staking: ["0xcfdb12299c2d0111ae1cee23337e9156deabfbf5"],
    PolicyBookRegistry: "0xab7c7356f706954c3c926a690e96c7b65fa76116",
    ShieldMining: "0xde52f95ea3373fab1deefde56d35fa1dacd83e99",
    usdt: ADDRESSES.polygon.USDT,
    bmi: "0xa10facae1abac4fae6312c615a9c3fd56075be1a",
  },
}

Object.keys(config).forEach(chain => {
  const { CapitalPool, staking, PolicyBookRegistry, ShieldMining, usdt, bmi, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const vusdtBalances = await api.call({ target: CapitalPool, abi: abi["virtualUsdtAccumulatedBalance"], })
      api.add(usdt, vusdtBalances)
      const policyBooks = await getPolicyBookList(api, PolicyBookRegistry)
      const tokens = await api.multiCall({ target: ShieldMining, abi: abi.getShieldTokenAddress, calls: policyBooks, })
      return sumTokens2({ api, tokensAndOwners2: [tokens, policyBooks] })
    },
    staking: sumTokensExport({ owners: staking, tokens: [bmi] })
  }
})

async function getPolicyBookList(api, PolicyBookRegistry) {
  const countPolicyBooks = await api.call({ target: PolicyBookRegistry, abi: abi["count"], })
  return api.call({ target: PolicyBookRegistry, params: [0, countPolicyBooks], abi: abi["list"], })
}
