const { sumTokens2 } = require('../helper/unwrapLPs')

// Issuer contract addresses
const LVUSD_Issuer = "0x135951057cfcccA7E8ef87ee41318D670f723F68";
const LVMON_Issuer = "0xbF52cED429C3901AfA4BBF25849269eF7A4ad105";
const MONStakingVault = "0xf71B390448df37C8379332F372f344A576574d4A";

const Issuers = [LVUSD_Issuer, LVMON_Issuer];

async function tvl(api) {
  const stakingState = await api.call({
    target: MONStakingVault,
    abi: "function stakingState() external view returns ((uint256 stakedBalance, uint64 lastEpoch))",
  });
  const stakedBalance = stakingState.stakedBalance ?? stakingState[0];

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
  await sumTokens2({
    api,
    tokensAndOwners2: [tokens, allVaults],
  })

  api.addGasToken(stakedBalance);
}

module.exports = {
  methodology: "Counts reserve tokens held in all vaults retrieved from LVUSD and LVMON issuers' Transparency contracts, plus MONStakingVault.stakingState.stakedBalance.",
  monad: { 
    tvl
  }
}
