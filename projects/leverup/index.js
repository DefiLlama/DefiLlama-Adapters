const { sumTokens2 } = require('../helper/unwrapLPs')

// Issuer contract addresses
const LVUSD_Issuer = "0x135951057cfcccA7E8ef87ee41318D670f723F68";
const LVMON_Issuer = "0xbF52cED429C3901AfA4BBF25849269eF7A4ad105";

const Issuers = [LVUSD_Issuer, LVMON_Issuer];

async function tvl(api) {
  // 1. Get Transparency contract address from each Issuer
  const transparencies = await api.multiCall({
    calls: Issuers,
    abi: "address:transparency", // function transparency() external view returns (ITransparency)
  });

  // 2. Get getAllVaults from Transparency contracts
  // Note: We call getAllVaults once for each Transparency contract
  // The result is a 2D array [[vaults1...], [vaults2...]], we flatten it
  const vaultsList = await api.multiCall({
    calls: transparencies,
    abi: "function getAllVaults() external view returns (address[])",
  });
  
  const allVaults = vaultsList.flat();

  // 3. Get the Reserve Token (underlying asset) for each Vault
  const tokens = await api.multiCall({
    calls: allVaults,
    abi: "address:reserveToken",
  })

  // 4. Use sumTokens2 to automatically calculate TVL
  return sumTokens2({
    api,
    tokensAndOwners2: [tokens, allVaults],
  })
}

module.exports = {
  methodology: "Counts the balance of reserve tokens held in all vaults retrieved from the Transparency contracts of LVUSD and LVMON issuers.",
  monad: { 
    tvl
  }
}
