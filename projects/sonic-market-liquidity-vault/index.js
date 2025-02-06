const { getLogs2 } = require('../helper/cache/getLogs')

const abi = {
  openEvent: 'event Open(bytes32 indexed key, uint192 indexed bookIdA, uint192 indexed bookIdB, bytes32 salt, address strategy)',
  getBookKey: "function getBookKey(uint192 id) view returns ((address base, uint64 unitSize, address quote, uint24 makerPolicy, address hooks, uint24 takerPolicy))",
  getLiquidity: "function getLiquidity(bytes32 key) view returns ((uint256 reserve, uint256 claimable, uint256 cancelable) liquidityA, (uint256 reserve, uint256 claimable, uint256 cancelable) liquidityB)",
}

const config = {
  rebalancer: '0x46107Ec44112675689053b96aea2127fD952bd47',
  bookManager: '0xD4aD5Ed9E1436904624b6dB8B1BE31f36317C636',
  blacklistedTokens: [],
  fromBlock: 6334629
}

async function tvl(api) {
  const { rebalancer, bookManager, fromBlock, blacklistedTokens } = config
  const logs = await getLogs2({ api, factory: rebalancer, eventAbi: abi.openEvent, fromBlock, extraKey: 'open-bookid' })
  const bookIds = logs.map(i => [i.bookIdA, i.bookIdB]).flat()
  const res = await api.multiCall({ abi: abi.getBookKey, calls: bookIds, target: bookManager })
  const tokens = res.map(i => [i.base, i.quote]).flat()
  return api.sumTokens({ owners: [rebalancer], tokens, blacklistedTokens })
}

module.exports = {
  methodology: "TVL includes all assets deposited into the Sonic Market Liquidity Vault contract, specifically allocated for liquidity provision and market-making within the Sonic Market ecosystem",
  sonic: { tvl }
}