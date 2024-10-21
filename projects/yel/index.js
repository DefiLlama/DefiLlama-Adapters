const { sumUnknownTokens, getTokenPrices } = require('../helper/unknownTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')
const {
  normalizeAddress,
} = require('../helper/tokenMapping')

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
    ownTokensAndOwners: [
      //               Token                                         Potion(lToken)                                  slToken
      ['0x949185D3BE66775Ea648F4a306740EA9eFF9C567', '0x7d2f5881F0C4B840fcFA2c49F4052d1A004eAf0d', '0xD451E3443Fc9e12d37F64EC0FeD100cE2c10D22A']
    ],
    tokensAndOwners: [
      //               Token                                         Potion(lToken)                                  slToken
      ['0x4300000000000000000000000000000000000004', '0x795a85CD543D0E2d29F7e11e33a20a38A4b5121e', '0x7D8490333315EaAa5e93F3C6983d1e8128D7f50f' ],
      ['0xb1a5700fa2358173fe465e6ea4ff52e36e88e2ad', '0x07BF0Bc908Ef4badF8ec0fB1f77A8dBFe33c33c0', '0x73681f24a4a099E71e0Ddd084f2310bA1E0b3a36' ],
    ],
  },
  base: {
    ownTokensAndOwners: [
      //               Token                                         Potion(lToken)                                  slToken
      ['0x949185D3BE66775Ea648F4a306740EA9eFF9C567', '0x516712404013200B499Cd8fAE4575E5d48F6Ba65', '0x38b8b2B4b063e71047474018707Fab2E9a2bB971']
    ],
    tokensAndOwners: [
      //               Token                                         Potion(lToken)                                  slToken
      ['0x4200000000000000000000000000000000000006', '0x0540f15374eCF13aAB3c0a76b643333CE0D00579', '0x0E7De1d6A1aA4178CBfce3dE4EAaD0427034f924'],
      ['0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', '0xE7349C94BDE0D13599Ed496342857bb231FeF02B', '0xabb4D7866e1059bD21581FC5FC6D49388D30a323'],
      ['0x1509706a6c66CA549ff0cB464de88231DDBe213B', '0x8a27CE3A836C8A9D962D86C099f229f3baF3EB4a', '0xFfeC8bAAa8cf32Bc7F85ea6a7C44Ad541309FD1F']
    ],
  }
}

async function tvl( api, coveredAssets){
  for(const assets of coveredAssets){
    const originalToken = normalizeAddress(assets[0])
    const potion = normalizeAddress(assets[1])
    const slToken = normalizeAddress(assets[2])

    let totalTokenBalance = 0
    const balances = await api.multiCall({
    abi : 'erc20:balanceOf',
    calls : [
      {
        target : originalToken,
        params : potion
      },
      {
        target : potion,
        params : slToken
      }
    ]
    })

    let potionSupply = Number( 
      await api.call({
        abi : 'erc20:totalSupply',
        target : potion,
      })
    )

    const tokenBalanceOnPotion = Number(balances[0])
    const ltokenBalanceOnSLToken = Number(balances[1])

    const cbr = tokenBalanceOnPotion / potionSupply

    totalTokenBalance = tokenBalanceOnPotion + (ltokenBalanceOnSLToken * cbr)

    api.add(originalToken, totalTokenBalance)
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

      if (tokensAndOwners){
        await tvl(api, tokensAndOwners)
      }

    },
    pool2: async (api) => {
      if (farms.length && lps.length)
        await sumUnknownTokens({ api, owners: farms, tokens: lps, resolveLP: true, useDefaultCoreAssets: true, lps, })

    },
    staking: async (api) => {
      if (farms.length && ownTokens.length)
        await sumUnknownTokens({ api, owners: farms, tokens: ownTokens, useDefaultCoreAssets: true, lps, })

      if (ownTokensAndOwners){
        await tvl(api, ownTokensAndOwners)
      }
    },
  }
})