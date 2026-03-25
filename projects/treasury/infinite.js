const { treasuryExports } = require("../helper/treasury");

const owners = [
  "0xb5dB6e5a301E595B76F40319896a8dbDc277CEfB",  // Main DAO treasury
  "0x1E2cD0E5905AFB73a67c497D82be271Cc65302Eb",  // API Cost revenue wallet
]

const config = {}
const chains = ['ethereum', 'arbitrum', 'optimism', 'polygon', 'base']
chains.forEach(chain => { config[chain] = { owners, resolveLP: true } })

module.exports = {
  ...treasuryExports(config),
  methodology: "Tracks Infinite Trading treasury holdings across multiple chains including token balances in multisig wallets. The API Cost revenue wallet (0x1E2cD0E5905AFB73a67c497D82be271Cc65302Eb) receives ongoing fees from users for API usage across all supported chains.",
}
