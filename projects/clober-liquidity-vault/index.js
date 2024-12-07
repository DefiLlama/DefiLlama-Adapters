const { getLogs2 } = require('../helper/cache/getLogs')
const sdk = require("@defillama/sdk");

const abi = {
  openEvent: 'event Open(bytes32 indexed key, uint192 indexed bookIdA, uint192 indexed bookIdB, bytes32 salt, address strategy)',
  getBookKey: "function getBookKey(uint192 id) view returns ((address base, uint64 unitSize, address quote, uint24 makerPolicy, address hooks, uint24 takerPolicy))",
  getLiquidity: "function getLiquidity(bytes32 key) view returns ((uint256 reserve, uint256 claimable, uint256 cancelable) liquidityA, (uint256 reserve, uint256 claimable, uint256 cancelable) liquidityB)",
}

const config = {
  base: {
    rebalancer: '0x6A0b87D6b74F7D5C92722F6a11714DBeDa9F3895',
    bookManager: '0x382CCccbD3b142D7DA063bF68cd0c89634767F76',
    fromBlock: 23040633,
  },
}

async function tvl(api) {
  const { rebalancer, bookManager, fromBlock } = config[api.chain]
  const logs = await getLogs2({ api, factory: rebalancer, eventAbi: abi.openEvent, fromBlock, extraKey: 'open-bookid' })
  const balances = {}
  for (const log of logs) {
    const poolKey = log.key
    const bookIdA = log.bookIdA
    const bookKeyA = await sdk.api.abi.call({
      chain: api.chain,
      target: bookManager,
      params: [bookIdA],
      abi: abi.getBookKey,
    });
    const currencyA = bookKeyA.output.quote
    const currencyB = bookKeyA.output.base
    const liquidity = await sdk.api.abi.call({
      chain: api.chain,
      target: rebalancer,
      params: [poolKey],
      abi: abi.getLiquidity,
    });
    const liquidityA = BigInt(liquidity.output.liquidityA.reserve) + BigInt(liquidity.output.liquidityA.claimable) + BigInt(liquidity.output.liquidityA.cancelable)
    const liquidityB = BigInt(liquidity.output.liquidityB.reserve) + BigInt(liquidity.output.liquidityB.claimable) + BigInt(liquidity.output.liquidityB.cancelable)
    balances[currencyA] = (balances[currencyA] || 0n) + liquidityA
    balances[currencyB] = (balances[currencyB] || 0n) + liquidityB
  }
  for (const [token, balance] of Object.entries(balances)) {
    api.addToken(token, balance.toString())
  }
  return api.getBalances()
}

module.exports = {
  methodology: "TVL includes all assets deposited into the Clober Liquidity Vault contract, specifically allocated for liquidity provision and market-making within the Clober ecosystem",
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
