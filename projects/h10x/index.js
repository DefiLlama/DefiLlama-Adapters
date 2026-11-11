const { sumTokensExport } = require('../helper/sumTokens')

// H10X Index (https://h10xindex.xyz): an index token on Hedera (H10X, 0.0.10907484) backed 1:1 by a basket of Hedera
// tokens held in an immutable vault. Issuing H10X requires depositing the proportional basket and redeeming returns it,
// so the vault's holdings are the TVL. Read from the Hedera mirror node (projects/helper/chain/hbar.js).
const VAULT = '0.0.10907483'

// Basket held by the vault. It changes only by governance (multisig 2-of-3, announced in advance); when a token is
// added it will be added here too.
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

module.exports = {
  timetravel: false,
  methodology: 'TVL is the basket of Hedera tokens held by the H10X vault (0.0.10907483), which backs every H10X token 1:1: issuing H10X requires depositing the proportional basket and redeeming returns it. Balances are read from the Hedera mirror node. H10X liquidity in SaucerSwap pools is not counted (it is part of SaucerSwap TVL), and H10X held by the vault as unclaimed fees is not counted either (it is backed by the same basket).',
  hedera: { tvl: sumTokensExport({ owners: [VAULT], tokens: BASKET }) },
}
