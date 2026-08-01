const { getLogs2 } = require('../helper/cache/getLogs');
const { getUniqueAddresses } = require('../helper/tokenMapping');
const { sumUnknownTokens } = require('../helper/unknownTokens');

const ABI = {
  "Stake": "event Stake(address indexed staker, address indexed token, uint256 amount)",
  "getTotalStake": "function getTotalStake(address token) view returns (uint256)",
  "WrappedTokenCreated": "event WrappedTokenCreated(address indexed underlyingToken, address indexed wrappedToken)"
}
const KAYER_WRAPPER_FACTORY = '0xAEdcF2bf41891777c5F638A098bbdE1eDBa7B264'

function customCacheFunction({ cache, logs }) {
  if (!cache.logs) cache.logs = []
  cache.logs.push(...logs.map(i => i.token))
  cache.logs = getUniqueAddresses(cache.logs)
  return cache
}

module.exports = {
  getExport: (STAKING_CONTRACT, fromBlock = 20248272) => ({
    misrepresentedTokens: true,
    chz: {
      tvl: () => ({}), staking: async (api) => {
        const KayenPairs = await api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: '0xE2918AA38088878546c1A18F2F9b1BC83297fdD3' })
        const tokens = await getLogs2({ api, target: STAKING_CONTRACT, fromBlock, customCacheFunction, eventAbi: ABI.Stake })
        const wrapperLogs = await getLogs2({ api, target: KAYER_WRAPPER_FACTORY, fromBlock: 12039720, eventAbi: ABI.WrappedTokenCreated })
        const wrappedTokensMap = {}
        const decimalsMap = {}
        const allTokens = [...tokens]
        wrapperLogs.forEach(log => {
          wrappedTokensMap[log.underlyingToken.toLowerCase()] = log.wrappedToken.toLowerCase()
          allTokens.push(log.wrappedToken)
        })
        const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: allTokens })
        decimals.forEach((d, i) => decimalsMap[allTokens[i].toLowerCase()] = d)
        const bals = await api.multiCall({ abi: ABI.getTotalStake, calls: tokens, target: STAKING_CONTRACT })

        tokens.forEach((v, i) => {
          let bal = bals[i]
          v = v.toLowerCase()
          if (wrappedTokensMap[v]) {

            const token = wrappedTokensMap[v]
            bal = bal * 10 ** (decimalsMap[token] - decimalsMap[v])
            api.add(token, bal)
          } else
            api.add(v, bal)
        })

        return sumUnknownTokens({ api, lps: KayenPairs, useDefaultCoreAssets: true, })
      },
    }
  })
}
