const sdk = require('@defillama/sdk')

const abi = {
  getBasket: 'function getBasket() view returns ((string chain, string symbol, string addr, uint8 decimals, uint256 amount)[])',
}

const ssi_tokens = [
  '0x9E6A46f294bB67c20F1D1E7AfB0bBEf614403B55',  // MAG7.ssi
  '0x164ffdaE2fe3891714bc2968f1875ca4fA1079D0',  // DEFI.ssi
  '0xdd3acDBDc7b358Df453a6CB6bCA56C92aA5743aA',  // MEME.ssi
]

const CHAIN_MAP = {
  ethereum: 'ETH',
  bsc: 'BSC_BNB',
  solana: 'SOL',
  bitcoin: 'BTC',
  cardano: 'ADA',
  ripple: 'XRP',
  doge: 'DOGE',
}

const NATIVE_CG_IDS = {
  ETH:     'ethereum',
  BSC_BNB: 'binancecoin',
  SOL:     'solana',
  BTC:     'bitcoin',
  ADA:     'cardano',
  XRP:     'ripple',
  DOGE:    'dogecoin',
}

const _basketCache = new Map()
async function getBaskets(timestamp) {
  if (!_basketCache.has(timestamp)) {
    const request = (async () => {
      const baseApi = new sdk.ChainApi({ chain: 'base', timestamp })
      return baseApi.multiCall({ abi: abi.getBasket, calls: ssi_tokens })
    })().catch((e) => {
      _basketCache.delete(timestamp)
      throw e
    })
    _basketCache.set(timestamp, request)
  }
  return _basketCache.get(timestamp)
}

function buildTvl(chainName) {
  return async (api) => {
    const baskets = await getBaskets(api.timestamp)
    baskets.forEach((basket) => {
      basket.forEach((token) => {
        if (token.chain !== chainName) return
        const amount = token.amount
        if (token.addr !== '') {
          const tokenAddress = ['ethereum', 'bsc'].includes(api.chain)
            ? token.addr.toLowerCase()
            : token.addr
          api.add(`${api.chain}:${tokenAddress}`, amount)
        } else {
          const cgId = NATIVE_CG_IDS[chainName]
          if (cgId) {
            const decimals = Number(token.decimals)
            const normalizedAmount = Number(BigInt(amount) * BigInt(1e9) / BigInt(10 ** decimals)) / 1e9
            api.addCGToken(cgId, normalizedAmount)
          } else {
            console.warn(`[ssi-protocol] No CoinGecko ID mapped for native chain "${chainName}" — skipping`)
          }
        }
      })
    })
  }
}

const chains = {}
Object.entries(CHAIN_MAP).forEach(([chain, chainName]) => {
  chains[chain] = { tvl: buildTvl(chainName) }
})

module.exports = {
  methodology: 'TVL counts the underlying tokens held in the baskets of all SoSoValue SSI index tokens (MAG7.ssi, DEFI.ssi, MEME.ssi). Basket composition is read directly from on-chain getBasket() calls on Base.',
  ...chains,
}
