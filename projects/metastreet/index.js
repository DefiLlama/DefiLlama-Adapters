const abi = require("./abi.json");

// Constants
const METASTREET_VAULT_REGISTRY = '0x07AB40311B992c8C75c4813388eDf95420e8f80A';

// Gets all MetaStreet Vaults registered in VaultRegistry and their
// corresponding currency token each vault's balance is denoted in
async function getAllVaultsAndTokens(api) {
  const vaults = await api.call({ abi: abi.getVaultList, target: METASTREET_VAULT_REGISTRY })
  const tokens = await api.multiCall({ abi: abi.currencyToken, calls: vaults })
  return [vaults, tokens]
}

// Calculates the TVL across all MetaStreet vaults
async function getTVL(api, vaults, tokens) {
  return api.sumTokens({ tokensAndOwners2: [tokens, vaults], })
}

// Calculates loan balance across all MetaStreet vaults
async function getBorrowed(api, vaults, tokens) {
  const res = await api.multiCall({ abi: abi.balanceState, calls: vaults })
  const bals = res.map((r) => r.totalLoanBalance)
  api.add(tokens, bals)
}

function getMetaStreetTVL(isBorrowed) {
  return async (api) => {
    // Get all vaults and tokens
    const [vaults, tokens] = await getAllVaultsAndTokens(api);
    if (isBorrowed) {
      await getBorrowed(api, vaults, tokens);
    } else {
      await getTVL(api, vaults, tokens);
    }
  }
}

module.exports = {
  ethereum: {
    tvl: getMetaStreetTVL(false),
    borrowed: getMetaStreetTVL(true),
  },
  methodology: 'TVL is calculated by getting the ERC20 balance of each vault, which counts tokens deposited into contracts for earning yield but not the value of any NFT loan note collateral the vault has purchased. Borrowed tokens are also not counted towards TVL.',
};