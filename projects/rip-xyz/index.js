const { sumTokens2 } = require('../helper/unwrapLPs')

const tokensAndOwners = [
    ['0x9125e2d6827a00b0f8330d6ef7bef07730bac685', '0xB0A980d0506610Cf08dCDee2a8112Bf103163ee2'], // Hypurr NFTs held by vault manager
    ['0x5555555555555555555555555555555555555555', '0xB0A980d0506610Cf08dCDee2a8112Bf103163ee2'], // WHYPE in vault manager
    ['0x5555555555555555555555555555555555555555', '0x0Df4f69CF9417b1817AB9579bF099537a694667B'], // WHYPE in rHYPURR vault
]

async function tvl(api) {
    await sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL includes the vault and vault manager's WHYPE and the vault manager's NFT holdings.",
  hyperliquid: { tvl },
};
