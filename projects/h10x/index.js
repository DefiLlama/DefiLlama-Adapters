const sdk = require('@defillama/sdk')
const { sumTokens } = require('../helper/chain/hbar')

// H10X vault. The basket changes only by governance (addComponent): update this list when it does.
const VAULT = '0.0.10907483'
const BASKET = [
  '0.0.1456986',  // WHBAR
  '0.0.10082597', // WBTC (LayerZero)
  '0.0.1460200',  // xSAUCE
  '0.0.9770617',  // WETH (LayerZero)
  '0.0.3716059',  // DOVU
  '0.0.4794920',  // PACK
  '0.0.834116',   // HBARX
  '0.0.7893707',  // GIB
]

// Basket tokens the coins server has no Hedera price for: counted at the price of the asset they represent.
const PRICED_AS = {
  '0.0.10082597': { coingeckoId: 'bitcoin', decimals: 8 },  // WBTC bridged 1:1 by LayerZero
  '0.0.9770617': { coingeckoId: 'ethereum', decimals: 8 },  // WETH bridged 1:1 by LayerZero
  '0.0.7893707': { coingeckoId: 'gib-4', decimals: 8 },     // GIB
}

async function tvl() {
  const balances = await sumTokens({ owners: [VAULT], tokens: BASKET })
  Object.entries(balances).forEach(([token, amount]) => {
    const priced = PRICED_AS[token.replace(/^hedera:/, '')]
    if (!priced) return
    delete balances[token]
    sdk.util.sumSingleBalance(balances, priced.coingeckoId, Number(amount) / 10 ** priced.decimals)
  })
  return balances
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the basket of Hedera tokens held by the H10X vault (0.0.10907483), which backs every H10X token 1:1: issuing H10X requires depositing the proportional basket and redeeming returns it. Balances are read from the Hedera mirror node. WBTC and WETH bridged by LayerZero are priced as BTC and ETH, and GIB with its CoinGecko price, because the coins server has no Hedera price for them. H10X liquidity in SaucerSwap pools is not counted (it is part of SaucerSwap TVL), and H10X held by the vault as unclaimed fees is not counted either (it is backed by the same basket).',
  hedera: { tvl },
}
