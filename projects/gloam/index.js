const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

// Gloam's shielded pool (ShieldPoolPayments), the same address on both chains.
const POOL = '0x39e28cde55cab798874746ac52cb4b5cc99a0194'
const GLOAM = '0xDcD885F5c60b3aD49F6D58718696417314e8724d'
const OUSD = '0x20c0000000000000000000006a37da5c996874be'

// pool balance minus the cash-out fees it holds for feeRecipient
async function addPoolBalances(api, tokens) {
  const balances = await api.getTokenBalances({ owner: POOL, tokens })
  const fees = await api.multiCall({ abi: 'function feesOwed(address) view returns (uint256)', target: POOL, calls: tokens })
  tokens.forEach((token, i) => api.add(token, BigInt(balances[i]) - BigInt(fees[i])))
}

module.exports = {
  methodology: 'TVL is the tokens held by the Gloam shielded pool on Robinhood Chain and Tempo, minus the cash-out fees the pool holds for the fee recipient. On Robinhood Chain the accepted assets are discovered from the pool\'s DepositLimitSet events. $GLOAM held in the pool is the protocol\'s own token and is counted under staking.',
  start: '2026-10-21',
  robinhood: {
    tvl: async (api) => {
      const logs = await getLogs2({ api, target: POOL, eventAbi: 'event DepositLimitSet(address indexed asset, uint128 perDeposit, uint128 total)', fromBlock: 94194599, extraKey: 'deposit-limit-set' })
      const tokens = [...new Set(logs.map(l => l.asset.toLowerCase()))].filter(t => t !== GLOAM.toLowerCase())
      await addPoolBalances(api, tokens)
    },
    staking: (api) => addPoolBalances(api, [GLOAM]),
  },
  tempo: {
    // static: the SDK's Tempo RPC rejects getLogs ranges; these are all of the pool's DepositLimitSet assets
    tvl: (api) => addPoolBalances(api, [ADDRESSES.tempo.pathUSD, ADDRESSES.tempo.USDC_E, ADDRESSES.tempo.USDT0, OUSD]),
  },
}
