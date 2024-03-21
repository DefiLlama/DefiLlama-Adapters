const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')
const { covalentGetTokens } = require('../helper/token')
const { isWhitelistedToken } = require('../helper/streamingHelper')
const { getUniqueAddresses } = require('../helper/utils')

const blacklistedTokens = [
  ADDRESSES.ethereum.sUSD_OLD,
  // TODO: We shouldn't need to lowercase here
  ADDRESSES.ethereum.SAI.toLowerCase(),
  ADDRESSES.ethereum.MKR,
]

async function getTokens(api, owners, isVesting) {
  let tokens = (await Promise.all(owners.map(i => covalentGetTokens(i, api, { onlyWhitelisted: false, })))).flat().filter(i => !blacklistedTokens.includes(i))
  tokens = getUniqueAddresses(tokens)
  const symbols = await api.multiCall({ abi: 'erc20:symbol', calls: tokens })
  return tokens.filter((v, i) => isWhitelistedToken(symbols[i], v, isVesting))
}

async function tvl(api) {
  const { owners } = config[api.chain]
  const tokens = await getTokens(api, owners, false)
  return sumTokens2({ api, owners, tokens, blacklistedTokens, })
}

async function vesting(api) {
  const { owners } = config[api.chain]
  const tokens = await getTokens(api, owners, true)
  return sumTokens2({ api, owners, tokens, blacklistedTokens, })
}

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2022-10-03') / 1e3), 'Vesting tokens are not included in tvl'],
  ],
  start: 1573582731,
  timetravel: false,
  ronin: {
    tvl: sumTokensExport({
      owner: '0xDe9dCc27aa1552d591Fc9B9c21881feE43BD8118',
      tokens: [
        ADDRESSES.ronin.USDC,
        ADDRESSES.ronin.WETH,
        ADDRESSES.ronin.AXS,
      ]
    })
  }
};

const config = {
  ethereum: {
    owners: [
      "0xA4fc358455Febe425536fd1878bE67FfDBDEC59a", // v1.0.0
      "0xCD18eAa163733Da39c232722cBC4E8940b1D8888", // v1.1.0
    ]
  },
  arbitrum: { owners: ['0xaDB944B478818d95659067E70D2e5Fc43Fa3eDe9'], },
  avax: { owners: ['0x73f503fad13203C87889c3D5c567550b2d41D7a4'], },
  bsc: { owners: ['0x05BC7f5fb7F248d44d38703e5C921A8c16825161'], },
  optimism: { owners: ['0x6C5927c0679e6d857E87367bb635decbcB20F31c'], },
  polygon: { owners: ['0xAC18EAB6592F5fF6F9aCf5E0DCE0Df8E49124C06'], },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, vesting }
})