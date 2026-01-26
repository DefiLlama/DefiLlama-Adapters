const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui")

// Vault configuration
// Package ID: 0x882cd9388d35a141614a7beb28ec14f7aaf54f8372ccc1dd64046efd82866043
// USDC Token: 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC
const VAULTS = [
  {
    id: "0xa33c96502b89cdfd177333c35d70b95451547d223a0d0abc5faeee82793500ab",
    name: "ActiveVault", // Hot wallet vault - USDC Vault (uses balance field)
  },
  {
    id: "0x7c44251e2fb7592df06cca21b043ace6ca97959c10628e7df08d0a39441bc4fb",
    name: "SecureVault", // Cold wallet vault - USDC Vault (uses balance field)
  },
  {
    id: "0x828a61bb8d28928363356a72ac038c34746ef1dc92bd331ba9564dce9c1d759b",
    name: "Vault", // Main vault - USDC Vault (uses total_shares field)
  }
]

async function tvl(api) {
  // Get all vaults in parallel
  const vaults = await sui.getObjects(VAULTS.map(v => v.id));
  
  for (const vault of vaults) {
    if (!vault || !vault.type) continue;
    
    // Extract token type from object type: ActiveVault<TokenType>, SecureVault<TokenType>, or Vault<TokenType>
    const typeString = vault.type.replace(">", "").split("<")[1];
    if (!typeString) continue;
    
    const tokenType = typeString;
    
    // Different vault types use different fields for balance
    // ActiveVault/SecureVault use 'balance' field
    // Vault uses 'total_shares' field
    let balance;
    if (vault.fields.balance !== undefined) {
      balance = vault.fields.balance;
    } else if (vault.fields.total_shares !== undefined) {
      balance = vault.fields.total_shares;
    } else {
      continue; // Skip if neither field exists
    }
    
    api.add(tokenType, balance);
  }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
}
