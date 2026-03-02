const { sumTokens2 } = require('../helper/unwrapLPs')

const WHYPE = "0x5555555555555555555555555555555555555555";
const VAULT_MANAGER = "0xB0A980d0506610Cf08dCDee2a8112Bf103163ee2";
const HYPURR_NFT = "0x9125e2d6827a00b0f8330d6ef7bef07730bac685"; 

const VAULTS = {
  rHYPURR: {
    address: "0x0Df4f69CF9417b1817AB9579bF099537a694667B",
    asset: WHYPE,
  },
};

async function tvl(api) {

    // hypurr nft holdings
    const bal = await api.call({target: HYPURR_NFT, abi: 'erc20:balanceOf', params: [VAULT_MANAGER]})
    if (bal > 0) {
      api.add(HYPURR_NFT, bal)
    }
    
    // idle vault funds
    await sumTokens2({api, tokensAndOwners: Object.values(VAULTS).map(vault => [vault.asset, vault.address])})
}

module.exports = {
  misrepresentedTokens: true, 
  methodology:
    "TVL includes HYPE in the vault and vault manager NFT holdings.",
  hyperliquid: {
    tvl,
  },
};