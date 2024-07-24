const { sumUnknownTokens } = require('../helper/unknownTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  ethereum: {
    farms: ['0x5dD8532613B9a6162BA795208D1A01613df26dc5', '0xe7c8477C0c7AAaD6106EBDbbED3a5a2665b273b9'], lps: ['0xc83ce8612164ef7a13d17ddea4271dd8e8eebe5d'], ownTokens: ['0x7815bDa662050D84718B988735218CFfd32f75ea']
  },
  bsc: {
    farms: ['0x954b15065e4FA1243Cd45a020766511b68Ea9b6E',], lps: ['0xa5ac78a856345ab1fc8a4550208f42ca34b54e56', '0x8290d3CA64f712de9FB7220353dAa55bf388F3A3'], ownTokens: ['0xd3b71117e6c1558c1553305b44988cd944e97300']
  },
  fantom: {
    farms: ['0x954b15065e4FA1243Cd45a020766511b68Ea9b6E', '0x3a6eE00959751A1981D731a5aC15B660a9a8BAd4'], lps: ['0x8BFf7b8B6a14e576a3634d6c0466A19A6E9b170a'], ownTokens: ['0xd3b71117e6c1558c1553305b44988cd944e97300']
  },
  polygon: {
    farms: ['0x954b15065e4FA1243Cd45a020766511b68Ea9b6E', '0x0379C1BbE394f835366D2EFDBf2AF09fBa0689A4'], lps: ['0x8bAb87ECF28Bf45507Bd745bc70532e968b5c2De'], ownTokens: ['0xd3b71117e6c1558c1553305b44988cd944e97300']
  },
  blast: {
    ownTokensAndOwners: [['0x949185D3BE66775Ea648F4a306740EA9eFF9C567', '0x7d2f5881F0C4B840fcFA2c49F4052d1A004eAf0d']],
    tokensAndOwners: [
      [ADDRESSES.blast.WETH, '0x795a85CD543D0E2d29F7e11e33a20a38A4b5121e'],
      [ADDRESSES.blast.BLAST, '0x7D8490333315EaAa5e93F3C6983d1e8128D7f50f'],
    ],
  }
}

Object.keys(config).forEach(chain => {
  const { farms = [], lps = [], ownTokens = [], ownTokensAndOwners, tokensAndOwners, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (api.chain === 'bsc') {
        const lpStaked = await api.call({ abi: 'uint256:totalLP', target: '0x660f09cF84F8f366Bc653942b54B114d0Ec9E8a2' })
        api.add('0xF65C1C0478eFDe3c19b49EcBE7ACc57BB6B1D713', lpStaked)
      } else if (api.chain === 'fantom') {
        const lpStaked = await api.call({ abi: 'uint256:totalLP', target: '0x61EB6f6bC4Ec28203e9973B44967dA263B3Ec0e3' })
        api.add('0xEc7178F4C41f346b2721907F5cF7628E388A7a58', lpStaked)
      }
      if (farms.length) {
        const res = await api.fetchList({ lengthAbi: 'poolLength', itemAbi: 'function poolInfo(uint256) view returns (address stakingToken, uint256, uint256, uint32, uint16)', calls: farms, groupedByInput: true })
        const ownerTokens = res.map((r, i) => ([r.map(i => i.stakingToken), farms[i]]))
        await sumTokens2({ api, ownerTokens, blacklistedTokens: [...lps, ...ownTokens], resolveLP: true, })
      }

      if (tokensAndOwners) return api.sumTokens({ tokensAndOwners })
    },
    pool2: async (api) => {
      if (farms.length && lps.length)
        await sumUnknownTokens({ api, owners: farms, tokens: lps, resolveLP: true, useDefaultCoreAssets: true, lps, })

    },
    staking: async (api) => {
      if (farms.length && ownTokens.length)
        await sumUnknownTokens({ api, owners: farms, tokens: ownTokens, useDefaultCoreAssets: true, lps, })

      if (ownTokensAndOwners) return api.sumTokens({ tokensAndOwners: ownTokensAndOwners })
    },
  }
})