const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')


async function getInFlightLidoRedemptionNav(api) {
 const unStEth = '0x889edc2edab5f40e902b864ad4d7ade8e412f9b1';
 const strategy = '0x60d2D94aCB969CA54e781007eE89F04c1A2e5943';
  const navHelper = '0xf22Ca896427677507a9EF99D30B261659775ff56';

 const requestIds = await api.call({
  abi: "function getWithdrawalRequests(address _owner) external view returns (uint256[] memory requestsIds)",
  target: unStEth,
  chain: 'ethereum',
  params: [strategy]
});


// NAV of lido in-flight redemptions in wstETH.
const nav =  await api.call({
  abi: 'function getLidoRedemptionsNav(uint[], address) external view returns (uint)',
  target: navHelper,
  chain: 'ethereum',
  params: [requestIds, strategy]
})

api.add(ADDRESSES.ethereum.WSTETH, nav)
}

// NAV of grow vault. 1 gtETH === 1 wstETH
async function addGrowAutovaultNav(api) {
  const gtEth_autovault = '0x5Fde59415625401278c4d41C6beFCe3790eb357f'
  const gtETH_totalSupply = await api.call({  abi: 'erc20:totalSupply', target: gtEth_autovault})
  const wstETH_balance = await api.call({ target: gtEth_autovault, abi: 'function convertToAssets(uint256) view returns (uint256)', params: gtETH_totalSupply, })

  api.add(ADDRESSES.ethereum.WSTETH, wstETH_balance, { skipChain: true })
}


async function tvl(api) {
  const vault = '0x551d155760ae96050439ad24ae98a96c765d761b'
  const tokens = await api.call({ abi: 'address[]:getAllowableAssets', target: vault })
  await api.sumTokens({ owner: vault, tokens })

  await getInFlightLidoRedemptionNav(api)
  await addGrowAutovaultNav(api)

  const storage = await api.call({ abi: 'address:strategyStorage', target: vault })
  const strategies = await api.fetchList({ lengthAbi: 'getStrategyCount', itemAbi: 'getStrategyAddress', target: storage })
  return sumTokens2({
    api, owners: strategies, fetchCoValentTokens: true, resolveUniV3: true, tokenConfig: {
      onlyWhitelisted: false,
    }
  })
}

async function tvlMantle(api) {
  return api.sumTokens({ owner: '0x5E4ACCa7a9989007cD74aE4ed1b096c000779DCC', tokens: ['0xE6829d9a7eE3040e1276Fa75293Bde931859e8fA'] })
}

module.exports = {
  methodology: 'Token balance in vault and strategy contracts',
  start: '2024-09-10', // Tuesday, September 10, 2024 12:00:00 AM,
  ethereum: {
    tvl,
  },
  mantle: {
    tvl: tvlMantle
  }
}