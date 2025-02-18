const { getLogs2 } = require('../helper/cache/getLogs');
const { getUniqueAddresses } = require('../helper/tokenMapping');
const { sumUnknownTokens } = require('../helper/unknownTokens');

const ABI = {
  "Stake": "event Stake(address indexed staker, address indexed token, uint256 amount)",
  "getTotalStake": "function getTotalStake(address token) view returns (uint256)",
}
function customCacheFunction({ cache, logs }) {
  if (!cache.logs) cache.logs = []
  cache.logs.push(...logs.map(i => i.token))
  cache.logs = getUniqueAddresses(cache.logs)
  return cache
}

module.exports = {
  getExport: (STAKING_CONTRACT, fromBlock = 20248272) => ({
    methodology: 'Accounts for all ERC20 tokens staked on the PEPPER staking contract.',
    chz: {
      tvl: () => ({}), staking: async (api) => {
        const KayenPairs = await api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: '0xE2918AA38088878546c1A18F2F9b1BC83297fdD3' })
        const tokens = await getLogs2({ api, target: STAKING_CONTRACT, fromBlock, customCacheFunction, eventAbi: ABI.Stake })
        const bals = await api.multiCall({ abi: ABI.getTotalStake, calls: tokens, target: STAKING_CONTRACT })
        api.add(tokens, bals)
        return sumUnknownTokens({ api, lps: KayenPairs, useDefaultCoreAssets: true, })
      },
    }
  })
}
