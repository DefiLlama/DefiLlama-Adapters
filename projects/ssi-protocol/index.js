const sdk = require('@defillama/sdk')

const abi = {
  getBasket: 'function getBasket() view returns ((string chain, string symbol, string addr, uint8 decimals, uint256 amount)[])',
  totalSupply: 'erc20:totalSupply',
  balanceOf: 'erc20:balanceOf',
}

const SSI_TOKENS = [
  // MAG7.ssi
  '0x9E6A46f294bB67c20F1D1E7AfB0bBEf614403B55',
  // DEFI.ssi
  '0x164ffdaE2fe3891714bc2968f1875ca4fA1079D0',
  // MEME.ssi
  '0xdd3acDBDc7b358Df453a6CB6bCA56C92aA5743aA'
]

function underlyingExports(chains) {
  const exportObj = {}
  Object.entries(chains).forEach(([chain, [chain_name, native_token]]) => {
    exportObj[chain] = {
      tvl: async (api) => {
        const balances = {}
        const [baskets, supplies] = await Promise.all([
          sdk.api.abi.multiCall({ abi: abi.getBasket, calls: SSI_TOKENS.map(target => ({ target })), chain: 'base' }),
          sdk.api.abi.multiCall({ abi: abi.totalSupply, calls: SSI_TOKENS.map(target => ({ target })), chain: 'base' }),
        ])
        const basketOutputs = baskets.output.map(i => i.output)
        const supplyOutputs = supplies.output.map(i => i.output)

        for (let i = 0; i < SSI_TOKENS.length; i++) {
          const basket = basketOutputs[i] || []
          const supply = supplyOutputs[i] ? BigInt(supplyOutputs[i]) : 0n
          if (!supply) continue

          for (const token of basket) {
            const tokenChain = token.chain ?? token[0]
            const tokenAddr = token.addr ?? token[2]
            const tokenDecimals = Number(token.decimals ?? token[3])
            const tokenAmount = token.amount ?? token[4]

            if (tokenChain !== chain_name) continue

            const amountPerShare = BigInt(tokenAmount || 0)
            if (!amountPerShare) continue
            const amount = amountPerShare * supply / (10n ** 18n)
            if (!amount) continue

            if (tokenAddr) {
              sdk.util.sumSingleBalance(balances, `${chain}:${tokenAddr}`, amount.toString())
            } else {
              sdk.util.sumSingleBalance(balances, native_token, Number(amount) / 10 ** tokenDecimals)
            }
          }
        }

        return balances
      }
    }
  })
  return exportObj
}

module.exports = {
  methodology: 'TVL counts the underlying tokens in the baskets of the SSI tokens.',
  ...underlyingExports({
    ethereum: ['ETH', 'ethereum'],
    bsc: ['BSC_BNB', 'binancecoin'],
    doge: ['DOGE', 'dogecoin'],
    solana: ['SOL', 'solana'],
    bitcoin: ['BTC', 'bitcoin'],
    cardano: ['ADA', 'cardano'],
    ripple: ['XRP', 'ripple'],
  })
}
