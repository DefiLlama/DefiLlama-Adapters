const { sumUnknownTokens } = require('../helper/unknownTokens')
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
      [ADDRESSES.blast.WETH, '0x795a85CD543D0E2d29F7e11e33a20a38A4b5121e', '0x7D8490333315EaAa5e93F3C6983d1e8128D7f50f' ],
      [ADDRESSES.blast.BLAST, '0x07BF0Bc908Ef4badF8ec0fB1f77A8dBFe33c33c0', '0x73681f24a4a099E71e0Ddd084f2310bA1E0b3a36' ],

      ['0xd43d8adac6a4c7d9aeece7c3151fca8f23752cf8', '0x074637fA6A6727a8f6E32E354A8f50dbD05EeF61', '0x22bA96d016315412af3Ed2806aF01dc65f5AE4a7' ],
      ['0xe36072dd051ce26261bf50cd966311cab62c596e', '0xC107e89b842403D3f3Be56D3b611a74388FF69dA', '0x83809649f0Ef1488a83f000AAEBEcef30eDe9A19' ],

    ],
  },
  base: {
    ownTokensAndOwners: [
      //               Token                                         Potion(lToken)                                  slToken
      ['0x949185D3BE66775Ea648F4a306740EA9eFF9C567', '0x1DC50dA045Ad23812c22148e03D62C9691958B47', '0xeB7C12e1395517300BF7D2Dc322B9422eC220af4']
    ],
    tokensAndOwners: [
      //               Token                                         Potion(lToken)                                  slToken
      [ADDRESSES.optimism.WETH_1, '0x56a827776511689d6502c5213425c4BFBE3915d1', '0x7e0BdBf619e480eed7d0772154e4092B019D84ab'],
      [ADDRESSES.base.USDC, '0x8ca29479CECa6eE24539508B90A02ec1939B88c6', '0x937DE27905fB22b4f965f54c4254B978EddC70a8'],
      ['0x79bbF4508B1391af3A0F4B30bb5FC4aa9ab0E07C', '0x2c21bFc177E297A83EAa87793c29E592fe81CeAC', '0xEB9e6a1dD2f52aC3b4aaba089c815f8CEfea4711'],
    ],
  },
  sonic: {
    ownTokensAndOwners: [
      //               Token                                         Potion(lToken)                                  slToken
      ['0x949185D3BE66775Ea648F4a306740EA9eFF9C567', '0x6E074300A7Bf53af6e20f1f07dDDfeedAE5598A8', '0x64E869D31aE8A567059872f597A8529CBd88DC98']
    ],
    tokensAndOwners: [
      //               Token                                         Potion(lToken)                                  slToken
      [ADDRESSES.sonic.wS, '0x7Ba0abb5f6bDCbf6409BB2803CdF801215424490', '0x24419689ac4A2D3Dafa07623129545f9b2156405'],
      [ADDRESSES.sonic.USDC_e, '0x995171196618b7FE0F0C6D606D79583DD1c8ff60', '0x5573aDB63D3eb7473C68Fdb2033CCbAc51a0Be0a'],

      ['0x79bbF4508B1391af3A0F4B30bb5FC4aa9ab0E07C', '0x92Dd17b19F74E696502Ee9eD478901F24c5d9a9A', '0x153ea9DF2B7977A8670a6EdF10b814d229D8d9Ef'],
      ['0x0e0Ce4D450c705F8a0B6Dd9d5123e3df2787D16B', '0xecf1b589F47511D23b026eF53D16FEbB89Aa5f3A', '0x590159e00c05E4C91f562Fe862cc90d75af5d28b'],
      ['0x9fDbC3f8Abc05Fa8f3Ad3C17D2F806c1230c4564', '0xdE31054Fb0ee7c6C39641db2e677011E276644aC', '0x665d2A102F7be403236bfa4Dcb6a207b2E41C54B'],
      [ADDRESSES.sonic.STS, '0x555733fBa1CA24ec45e7027E00C4B6c5065BaC96', '0x660579889896782DC7c141D1686eB298F3118278'],
      ['0x7A0C53F7eb34C5BC8B01691723669adA9D6CB384', '0x85262a5121B8aD219C521665787A6F21eCbBf679', '0xCA729958020a588525d1ba83dD20E88A88551D0a'],
      ['0x59524D5667B299c0813Ba3c99a11C038a3908fBC', '0x30Fb515Cf3e0C7fF94Aa923788B466F44768cAA4', '0x766fCe41F2521f311c77531e4aCA904f5e30fF52'],

      [ADDRESSES.sonic.scUSD, '0x2C7A01DE0c419421EB590F9ECd98cBbca4B9eC2A', '0x4E0B0a8c601b0F977d7a72476Ca3ea8A387f5c77'],
      [ADDRESSES.sonic.scETH, '0x8a3B47d5e13fCeD000dC4cDcbE28EAA2A5Cc24e1', '0x81C7eD1CD4582E61CF5291496E3EEa1dcd2423cC'],

      ['0xb1e25689D55734FD3ffFc939c4C3Eb52DFf8A794', '0xde1F938A7EfE5203E66B4D0efA667f116cBC7C45', '0x4b1C957ff3b9d55f382Be1a3C86B7eA54Be6a93a'],
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
