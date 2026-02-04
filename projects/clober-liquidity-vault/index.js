const { getLogs2 } = require('../helper/cache/getLogs')

const abi = {
  openEvent: 'event Open(bytes32 indexed key, uint192 indexed bookIdA, uint192 indexed bookIdB, bytes32 salt, address strategy)',
  getBookKey: "function getBookKey(uint192 id) view returns ((address base, uint64 unitSize, address quote, uint24 makerPolicy, address hooks, uint24 takerPolicy))",
  getLiquidity: "function getLiquidity(bytes32 key) view returns ((uint256 reserve, uint256 claimable, uint256 cancelable) liquidityA, (uint256 reserve, uint256 claimable, uint256 cancelable) liquidityB)",
}

const config = {
  base: {
    rebalancer: '0xeA0E19fbca0D9D707f3dA10Ef846cC255B0aAdf3',
    bookManager: '0x382CCccbD3b142D7DA063bF68cd0c89634767F76',
    blacklistedTokens: ['0x000000000000bb1b11e5ac8099e92e366b64c133'],
    fromBlock: 21715410,
  },
  monad: {
    rebalancer: '0xB09684f5486d1af80699BbC27f14dd5A905da873',
    bookManager: '0x6657d192273731C3cAc646cc82D5F28D0CBE8CCC',
    blacklistedTokens: [],
    fromBlock: 31662843
  }
}

async function tvl(api) {
  const { rebalancer, bookManager, fromBlock, blacklistedTokens } = config[api.chain]
  const logs = await getLogs2({ api, factory: rebalancer, eventAbi: abi.openEvent, fromBlock, extraKey: 'open-bookid' })
  const bookIds = logs.map(i => [i.bookIdA, i.bookIdB]).flat()
  const res = await api.multiCall({ abi: abi.getBookKey, calls: bookIds, target: bookManager })
  const tokens = res.map(i => [i.base, i.quote]).flat()
  return api.sumTokens({ owners: [rebalancer], tokens, blacklistedTokens })
}

module.exports = {
  methodology: "TVL includes all assets deposited into the Clober Liquidity Vault contract, specifically allocated for liquidity provision and market-making within the Clober ecosystem",
  monad: { tvl },
  base: { tvl },
}
