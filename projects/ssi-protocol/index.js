const sdk = require('@defillama/sdk')

const abi = {
  getBasket: 'function getBasket() view returns ((string chain, string symbol, string addr, uint8 decimals, uint256 amount)[])'
}

const ssi_tokens = [
  '0x9E6A46f294bB67c20F1D1E7AfB0bBEf614403B55', // MAG7.ssi
  '0x164ffdaE2fe3891714bc2968f1875ca4fA1079D0', // DEFI.ssi
  '0xdd3acDBDc7b358Df453a6CB6bCA56C92aA5743aA', // MEME.ssi
]

const chainConfig = {
  'ETH': { chain: 'ethereum' },
  'BSC_BNB': { chain: 'bsc' },
  'DOGE': { chain: 'doge', cgId: 'dogecoin' },
  'SOL': { chain: 'solana', cgId: 'solana' },
  'BTC': { chain: 'bitcoin', cgId: 'bitcoin' },
  'ADA': { chain: 'cardano', cgId: 'cardano' },
  'XRP': { chain: 'ripple', cgId: 'ripple' },
  'HYPEREVM_HYPE': { chain: 'hyperliquid' },
}

async function getBaskets(api) {
  const baseApi = new sdk.ChainApi({ chain: 'base', timestamp: api.timestamp })
  return Promise.all(ssi_tokens.map(target => baseApi.call({ abi: abi.getBasket, target })))
}

function makeChainTvl(chainKey) {
  return async function tvl(api) {
    const baskets = await getBaskets(api)
    for (const basket of baskets) {
      for (const token of basket) {
        const cfg = chainConfig[token.chain]
        if (!cfg || cfg.chain !== chainKey) continue
        if (token.addr) {
          api.add(token.addr, token.amount)
        } else if (cfg.cgId) {
          api.addCGToken(cfg.cgId, token.amount / 10 ** token.decimals)
        } else {
          api.addGasToken(token.amount)
        }
      }
    }
  }
}

const chains = [...new Set(Object.values(chainConfig).map(c => c.chain))]
const mod = { methodology: 'TVL counts the underlying tokens in the baskets of the SSI index tokens on Base.' }
chains.forEach(chain => { mod[chain] = { tvl: makeChainTvl(chain) } })

module.exports = mod
