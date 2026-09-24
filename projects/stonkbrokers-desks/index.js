const { sumTokens2 } = require('../helper/unwrapLPs')
const { liveAt } = require('../stonkbrokers/helpers')

// Anvil 2 way desks (InternExchange): permissionless NFT desks where a
// creator stakes quote tokens (bids), NFTs (asks) or both onto a price ladder
// for any ERC-721 collection. Every desk is an EIP-1167 clone enumerated by
// the exchange; each desk custodies its own quote balance and its NFTs.
const config = {
  robinhood: { exchange: '0xDea32D8AEE85B41A0f320Ff823e4625AAB01f518', fromBlock: 70008491 },
  ethereum: { exchange: '0xE272B47AF5d8de38E7D09c048a81480290478193', fromBlock: 26036272 },
}

// The protocol's own token is tracked under staking, not TVL.
const STONKBROKER = '0xe934e36A439C94017B64a3FecE66AF12099aBF50'

async function deskQuotes(api) {
  const { exchange, fromBlock } = config[api.chain]
  if (!liveAt(api, fromBlock)) return []
  const count = Number(await api.call({ abi: 'uint256:poolCount', target: exchange }))
  if (!count) return []
  const pools = await api.multiCall({ abi: 'function poolAt(uint256) view returns (address)', target: exchange, calls: Array.from({ length: count }, (_, i) => i) })
  const quotes = await api.multiCall({ abi: 'address:quote', calls: pools })
  return pools.map((pool, i) => [[quotes[i]], pool])
}

// Only the quote side of each desk counts; the NFTs held on the ask ladders
// have no token price and are left out.
async function tvl(api) {
  const ownerTokens = await deskQuotes(api)
  if (!ownerTokens.length) return
  await sumTokens2({ api, ownerTokens })
  if (api.chain === 'robinhood') api.removeTokenBalance(STONKBROKER)
}

async function staking(api) {
  const ownerTokens = (await deskQuotes(api)).filter(([[quote]]) => quote.toLowerCase() === STONKBROKER.toLowerCase())
  if (!ownerTokens.length) return
  await sumTokens2({ api, ownerTokens })
}

module.exports = {
  methodology:
    'TVL is the quote token liquidity staked on every Anvil 2 way desk (InternExchange) on Robinhood Chain and Ethereum: each desk is enumerated from the exchange registry and its idle quote balance (ETH, WETH, USDG, stock tokens on Robinhood; ETH, WBTC, USDT, USDC, APE, XAUt on Ethereum) is counted. NFTs listed on the ask ladders are not priced. STONKBROKER quoted desks are tracked under staking.',
  doublecounted: false,
  robinhood: { start: '2026-09-22', tvl, staking },
  ethereum: { start: '2026-09-22', tvl },
}
