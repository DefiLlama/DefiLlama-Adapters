const sdk = require('@defillama/sdk')
const { get } = require('../helper/http')
const { getConfig } = require('../helper/cache')
const { sumTokensExport } = require('../helper/sumTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { transformBalances } = require('../helper/portedTokens')
const { nullAddress } = require('../helper/tokenMapping');

const ABI = {
  wantLockedTotal: "uint256:wantLockedTotal",
  farms: "function farms(address) view returns (address)"
}

const vaults = {
  bsc: '0x89c527764f03BCb7dC469707B23b79C1D7Beb780',
  celo: '0x979cD0826C2bf62703Ef62221a4feA1f23da3777',
  ethereum: '0x1bf68a9d1eaee7826b3593c20a0ca93293cb489a',
  heco: '0x38C92A7C2B358e2F2b91723e5c4Fc7aa8b4d279F',
  klaytn: '0x9abc3f6c11dbd83234d6e6b2c373dfc1893f648d',
  polygon: '0x506DC4c6408813948470a06ef6e4a1DaF228dbd5',
  meta: '0x292A00F3b99e3CB9b324EdbaA92258C3C61b55ab',
  wemix: '0x445F863df0090f423A6D7005581e30d5841e4D6d'
}

const farms = {
  bsc: [
    '0x0000000000000000000000000000000000000000',// BNB
    '0x55d398326f99059ff775485246999027b3197955',// USDT-B
    '0xe9e7cea3dedca5984780bafc599bd69add087d56',// BUSD
    '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',// CAKE
  ],
  ethereum: [
    '0x0000000000000000000000000000000000000000',// ETH
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',// USDT
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',// DAI
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',// USDC
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',// WBTC
  ]
}

let tokenData

function chainTvls(chain) {
  return async (timestamp, ethBlock, {[chain]: block}) => {
    const vault = vaults[chain]
    let targetChain = chain
    if (chain === 'ethereum') targetChain = 'eth'
    if (chain === 'polygon') targetChain = 'matic'

    const tokenListURL = 'https://bridge.orbitchain.io/open/v1/api/monitor/rawTokenList'
    tokenData = tokenData || getConfig('orbit-bridge', tokenListURL)
    const data = await tokenData

    let tokenList = data.origins.filter(x => x.chain === targetChain && !x.is_nft).map(x => x.address)
    tokenList.push(nullAddress)
    const balances = await sumTokens2({ owner: vault, tokens: tokenList, chain, block, blacklistedTokens: [
      '0x662b67d00a13faf93254714dd601f5ed49ef2f51' // ORC, blacklist project's own token
      // reason for skipping, most of the tvl comes from this transaction which is about 25% of ORU supply on ETH
      // https://etherscan.io/tx/0x0a556fcef2a867421ec3941251ad3c10ae1402a23ddd9ad4b1097b686ced89f7
    ] })

    if (farms[chain]) {
      const calls = farms[chain].map(i => ({ params: i }))
      const { output: farmData } = await sdk.api.abi.multiCall({
        target: vault,
        abi: ABI.farms,
        calls, chain, block,
      })
      const { output: farmBalance } = await sdk.api.abi.multiCall({
        abi: ABI.wantLockedTotal,
        calls: farmData.map(i => ({ target: i.output})), 
        chain, block,
      })
      farmBalance.forEach((data, i) => sdk.util.sumSingleBalance(balances, chain + ':' + farms[chain][i], data.output))
    }
    return balances
  }
}

module.exports = {
  methodology: 'Tokens locked in Orbit Bridge contract are counted as TVL',
  timetravel: false,
  bsc: {
    tvl: chainTvls('bsc')
  },
  celo: {
    tvl: chainTvls('celo')
  },
  heco: {
    tvl: chainTvls('heco')
  },
  ethereum: {
    tvl: chainTvls('ethereum')
  },
  klaytn: {
    tvl: chainTvls('klaytn')
  },
  polygon: {
    tvl: chainTvls('polygon')
  },
  meta: {
    tvl: chainTvls('meta')
  },
  wemix: {
    tvl: chainTvls('wemix')
  },
  ripple: {
    tvl: sumTokensExport({ chain: 'ripple', owner: 'rLcxBUrZESqHnruY4fX7GQthRjDCDSAWia'})
  },
  ton: {
    tvl: async () => {
      let ton_vault = "EQAtkbV8ysI75e7faO8Ihu0mFtmsg-osj7gmrTg_mljVRccy"
      const res = await get(`https://tonapi.io/v1/account/getInfo?account=${ton_vault}`)
      return await transformBalances('ton', {"0x0000000000000000000000000000000000000000": res.balance})
    }
  },
}