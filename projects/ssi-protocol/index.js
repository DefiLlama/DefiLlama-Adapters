const abi = {
  getBasket: 'function getBasket() view returns ((string chain, string symbol, string addr, uint8 decimals, uint256 amount)[])',
}

const SSI_TOKENS = [
  '0x9E6A46f294bB67c20F1D1E7AfB0bBEf614403B55', // MAG7.ssi
  '0x164ffdaE2fe3891714bc2968f1875ca4fA1079D0', // DEFI.ssi
  '0xdd3acDBDc7b358Df453a6CB6bCA56C92aA5743aA', // MEME.ssi
]

const SYMBOL_TO_CGID = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana',
  BNB: 'binancecoin', BSC_BNB: 'binancecoin',
  XRP: 'ripple', DOGE: 'dogecoin', ADA: 'cardano',
  AVAX: 'avalanche-2', DOT: 'polkadot', LINK: 'chainlink',
  UNI: 'uniswap', AAVE: 'aave', MKR: 'maker',
  LDO: 'lido-dao', CRV: 'curve-dao-token', SNX: 'havven',
  COMP: 'compound-governance-token', SUSHI: 'sushi',
  SHIB: 'shiba-inu', PEPE: 'pepe', FLOKI: 'floki',
  BONK: 'bonk', WIF: 'dogwifcoin', BRETT: 'brett',
  MOG: 'mog-coin', POPCAT: 'popcat',
  USDC: 'usd-coin', USDT: 'tether',
}

async function tvl(api) {
  const baskets = await api.multiCall({ abi: abi.getBasket, calls: SSI_TOKENS })

  const balances = {}
  for (const basket of baskets) {
    for (const component of basket) {
      const { symbol, decimals, amount } = component
      const cgId = SYMBOL_TO_CGID[symbol.toUpperCase()]
      if (!cgId || BigInt(amount) <= 0n) continue
      // coingecko IDs require real amount (divided by decimals)
      const realAmount = Number(amount) / 10 ** Number(decimals)
      balances[`coingecko:${cgId}`] = (balances[`coingecko:${cgId}`] || 0) + realAmount
    }
  }
  return balances
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL counts the underlying tokens in the baskets of the SSI tokens. For each index token (MAG7.ssi, DEFI.ssi, MEME.ssi), the basket composition is fetched on-chain via getBasket() which returns total underlying asset balances.',
  start: 1733011200,
  base: { tvl },
}
