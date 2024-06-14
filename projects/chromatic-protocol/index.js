const ADDRESSES = require("../helper/coreAssets.json")

const config = {
  arbitrum: {
    marketFactory: '0x0b216AB26E20d6caA770B18596A3D53B683638B4',
    lpRegistry: '0xc337325525eF17B7852Fd36DA400d3F9eEd51A4a',
    tokens: {
      USDT: ADDRESSES.arbitrum.USDT,
    },
    vault: "0x19631A51aeDcd831E29cbCbCfe77010dAfd3343a",
    pools: {
      USDT: [
        {
          name: "crescendo long & short ( deprecated )",
          address: "0xAD6FE0A0d746aEEEDEeAb19AdBaDBE58249cD0c7",
        },
        {
          name: "plateau long & short ( deprecated )",
          address: "0xFa334bE13bA4cdc5C3D9A25344FFBb312d2423A2",
        },
        {
          name: "decrescendo long & short ( deprecated )",
          address: "0x9706DE4B4Bb1027ce059344Cd42Bb57E079f64c7",
        }
      ],
    },
  },
}


Object.keys(config).forEach(chain => {
  const { tokens, vault, pools, marketFactory, lpRegistry } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const settlementTokens = await api.call({ abi: abi.registeredSettlementTokens, target: marketFactory })
      const lpAddressesBySettlementToken = await api.multiCall({ abi: abi.lpListBySettlementToken, calls: settlementTokens, target: lpRegistry })
      const ownerTokens = settlementTokens.map((settlementToken, i) => lpAddressesBySettlementToken[i].map(j => [[settlementToken], j])).flat()
      ownerTokens.push([Object.values(tokens), vault])
      if (pools) {
        const _tokens = Object.values(tokens)
        Object.values(pools).forEach(i => i.forEach(p => ownerTokens.push([_tokens, p.address])))
      }
      return api.sumTokens({ ownerTokens })
    }
  }
})

const abi = {
  "registeredSettlementTokens": "address[]:registeredSettlementTokens",
  "lpListBySettlementToken": "function lpListBySettlementToken(address token) view returns (address[])"
}