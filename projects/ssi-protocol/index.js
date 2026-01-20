const sdk = require('@defillama/sdk')
const { getBlock } = require('../helper/http');

// SSI token addresses on Base
const ssi_tokens = [
  '0x9E6A46f294bB67c20F1D1E7AfB0bBEf614403B55', // MAG7.ssi
  '0x164ffdaE2fe3891714bc2968f1875ca4fA1079D0', // DEFI.ssi
  '0xdd3acDBDc7b358Df453a6CB6bCA56C92aA5743aA', // MEME.ssi
  // '0x3a46ed8FCeb6eF1ADA2E4600A522AE7e24D2Ed18'  // USSI - Disabled: different contract type or not active
]

// ABI for getBasket function - returns basket composition
const abi = {
  getBasket: 'function getBasket() view returns (tuple(string chain, string symbol, string addr, uint8 decimals, uint256 amount)[])'
}

// Chain name to CoinGecko ID mapping
const CHAIN_MAPPINGS = {
  'ETH': 'ethereum',
  'BTC': 'bitcoin',
  'SOL': 'solana',
  'BSC_BNB': 'binancecoin',
  'DOGE': 'dogecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'AVAX': 'avalanche-2',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'TRX': 'tron',
  'LTC': 'litecoin',
  'SHIB': 'shiba-inu',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'AAVE': 'aave',
  'CRV': 'curve-dao-token',
  'MKR': 'maker',
  'SNX': 'synthetix-network-token',
  'COMP': 'compound-governance-token',
  'SUSHI': 'sushi',
  'YFI': 'yearn-finance',
  'PEPE': 'pepe',
  'WIF': 'dogwifcoin',
  'BONK': 'bonk',
  'FLOKI': 'floki',
}

// Chain name to DefiLlama chain ID
const CHAIN_TO_ID = {
  'ETH': 'ethereum',
  'BTC': 'bitcoin',
  'SOL': 'solana',
  'BSC_BNB': 'bsc',
  'DOGE': 'doge',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'AVAX': 'avax',
  'DOT': 'polkadot',
  'MATIC': 'polygon',
  'TRX': 'tron',
  'LTC': 'litecoin',
}

async function tvl(api) {
  const balances = {}
  
  // Get the block for Base chain
  const baseBlock = await getBlock(api.timestamp, 'base', {})
  
  // Fetch basket composition from all SSI tokens
  const baskets = await Promise.all(ssi_tokens.map(async (ssi_token) => {
    try {
      const res = await sdk.api.abi.call({
        abi: abi.getBasket,
        target: ssi_token,
        chain: 'base',
        block: baseBlock,
      })
      return res.output || []
    } catch (e) {
      console.error(`Error fetching basket for ${ssi_token}:`, e)
      return []
    }
  }))
  
  // Process each basket and aggregate balances
  baskets.forEach(basket => {
    if (!basket || !Array.isArray(basket)) return
    
    basket.forEach(token => {
      try {
        const chainName = token.chain
        const symbol = token.symbol
        const addr = token.addr
        const decimals = token.decimals
        const amount = token.amount
        
        // For native tokens (empty address), use CoinGecko ID
        if (!addr || addr === '') {
          const coingeckoId = CHAIN_MAPPINGS[chainName]
          if (coingeckoId) {
            // Amount is already in the correct decimals, divide by 10^decimals
            const actualAmount = Number(amount) / Math.pow(10, decimals)
            sdk.util.sumSingleBalance(balances, coingeckoId, actualAmount)
          }
        } else {
          // For token addresses, use chain:address format
          const chain = CHAIN_TO_ID[chainName]
          if (chain) {
            // For EVM chains
            if (['ethereum', 'bsc', 'avax', 'polygon'].includes(chain)) {
              sdk.util.sumSingleBalance(balances, `${chain}:${addr}`, amount)
            } else if (chain === 'solana') {
              // For Solana, use the token address directly
              sdk.util.sumSingleBalance(balances, `solana:${addr}`, amount)
            } else {
              // For other chains, try to use CoinGecko ID if available
              const coingeckoId = CHAIN_MAPPINGS[chainName]
              if (coingeckoId) {
                const actualAmount = Number(amount) / Math.pow(10, decimals)
                sdk.util.sumSingleBalance(balances, coingeckoId, actualAmount)
              }
            }
          } else {
            // Fallback: try to use CoinGecko ID for the symbol
            const coingeckoId = CHAIN_MAPPINGS[chainName]
            if (coingeckoId) {
              const actualAmount = Number(amount) / Math.pow(10, decimals)
              sdk.util.sumSingleBalance(balances, coingeckoId, actualAmount)
            }
          }
        }
      } catch (e) {
        console.error('Error processing token:', token, e)
      }
    })
  })
  
  return balances
}

module.exports = {
  methodology: 'TVL counts the underlying tokens in the baskets of the SSI tokens. The getBasket() function returns the composition of each index token, including chain, symbol, address, decimals, and amount for each constituent asset. These amounts represent actual on-chain holdings across multiple blockchains (ETH, BTC, SOL, BNB, etc.) that back the index tokens.',
  base: {
    tvl
  }
}