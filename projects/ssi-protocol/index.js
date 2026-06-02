// SSI tokens are custodied index tokens on Base.
// TVL = totalSupply of each SSI token, priced via their token address.
// Underlying assets (BTC, ETH, SOL etc.) are held off-chain by Cobo/Ceffu.
// On-chain TVL is computed from actual token supply × market price.

const SSI_TOKENS = [
  '0x9E6A46f294bB67c20F1D1E7AfB0bBEf614403B55', // MAG7.ssi
  '0x164ffdaE2fe3891714bc2968f1875ca4fA1079D0', // DEFI.ssi
  '0xdd3acDBDc7b358Df453a6CB6bCA56C92aA5743aA', // MEME.ssi
]

async function tvl(api) {
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: SSI_TOKENS })
  SSI_TOKENS.forEach((token, i) => api.add(token, supplies[i]))
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is the total supply of each SSI index token (MAG7.ssi, DEFI.ssi, MEME.ssi) multiplied by its market price. SSI tokens are custodied index tokens backed by underlying crypto assets held by institutional custodians.',
  start: 1733011200,
  base: { tvl },
}
