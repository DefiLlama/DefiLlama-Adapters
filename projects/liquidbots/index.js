const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { AbiCoder } = require('ethers')

const FACTORY = '0x7a4CbfC403f3aA935D8223750c95077f27b36318'
const FACTORY_FROM_BLOCK = 26157501
const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'
const ACCOUNT_MARGIN_SUMMARY = '0x000000000000000000000000000000000000080F'
const PERP_DEX_INDEX = 0
const CHUNK = 50 // accounts per Multicall3 batch (tune to the RPC's eth_call gas cap)

const coder = AbiCoder.defaultAbiCoder()
const AGGREGATE3 = 'function aggregate3((address target, bool allowFailure, bytes callData)[] calls) payable returns ((bool success, bytes returnData)[] returnData)'

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    eventAbi: 'event LqTraderCreated(address indexed user, address indexed traderAddr, string name)',
    fromBlock: FACTORY_FROM_BLOCK,
  })
  const traders = [...new Set(logs.map((l) => l.traderAddr))]
  if (!traders.length) return

  //    sum each account's equity from the AccountMarginSummary precompile via Multicall3.
  //    The precompile takes raw abi(uint32 perpDexIndex, address) — NO function selector —
  //    and returns (int64 accountValue, uint64 marginUsed, uint64 ntlPos, int64 rawUsd).
  let total = 0n
  for (let i = 0; i < traders.length; i += CHUNK) {
    const calls = traders.slice(i, i + CHUNK).map((t) => [
      ACCOUNT_MARGIN_SUMMARY,
      true, // allowFailure
      coder.encode(['uint32', 'address'], [PERP_DEX_INDEX, t]),
    ])
    const results = await api.call({ target: MULTICALL3, abi: AGGREGATE3, params: [calls] })
    for (const r of results) {
      const success = r[0] ?? r.success
      const returnData = r[1] ?? r.returnData
      if (!success || !returnData || returnData === '0x') continue
      const [accountValue] = coder.decode(['int64', 'uint64', 'uint64', 'int64'], returnData)
      total += BigInt(accountValue)
    }
  }

  // accountValue is USD in 1e6 units == USDC base units (6 decimals).
  if (total > 0n) api.add(ADDRESSES.hyperliquid.USDC, total.toString())
}

module.exports = {
  methodology:
    'TVL is the total account value across every LqTrader account on Hyperliquid. Accounts are ' +
    'enumerated on-chain from the LqFactory LqTraderCreated event; each account\'s equity is read ' +
    'from the Hyperliquid AccountMarginSummary precompile, batched via Multicall3, and summed ' +
    '(counted as USDC).',
  hyperliquid: { tvl },
}
