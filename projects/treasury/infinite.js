const { sumTokens2 } = require('../helper/unwrapLPs')

// === Treasury Multisigs ===
const TREASURY_1 = "0xb5dB6e5a301E595B76F40319896a8dbDc277CEfB"  // Main DAO treasury
const TREASURY_2 = "0x1E2cD0E5905AFB73a67c497D82be271Cc65302Eb"  // Secondary treasury

// === dHEDGE Factory Contracts (for vault discovery) ===
const DHEDGE_FACTORY = {
  optimism: "0x5e61a079A178f0E5784107a4963baAe0c5a680c6",
  arbitrum: "0xffFb5fB14606EB3a548C113026355020dDF27535",
  polygon: "0xfdc7b8bFe0DD3513Cc669bB8d601Cb83e2F69cB0",
  base: "0x49Afe3abCf66CF09Fab86cb1139D8811C8afe56F"
}

// dHEDGE ABIs
const DHEDGE_V2_FACTORY_ABI = "function getManagedPools(address manager) view returns (address[] managedPools)"
const DHEDGE_V2_VAULT_SUMMARY_ABI = "function getFundSummary() view returns (tuple(string name, uint256 totalSupply, uint256 totalFundValue))"

// Treasury TVL: sum all tokens in treasury multisigs
const getTreasuryTVL = async (api) => {
  return sumTokens2({ 
    api, 
    owners: [TREASURY_1, TREASURY_2],
    resolveLP: true,  // Resolve LP tokens if treasury holds auto-compounder LPs
  })
}

// dHEDGE managed vaults TVL: Infinite Trading manages dHEDGE vaults across chains
const getDhedgeVaultsTVL = async (api) => {
  const { chain } = api
  const factory = DHEDGE_FACTORY[chain]
  
  if (!factory) return
  
  // Get all vaults managed by TREASURY_1 (the main DAO wallet)
  const managedVaults = await api.call({
    abi: DHEDGE_V2_FACTORY_ABI,
    target: factory,
    params: [TREASURY_1],
  })
  
  if (!managedVaults || managedVaults.length === 0) return
  
  // Get total fund value for each vault
  const summaries = await api.multiCall({
    abi: DHEDGE_V2_VAULT_SUMMARY_ABI,
    calls: managedVaults,
    permitFailure: true,
  })
  
  // Sum up all vault TVLs (totalFundValue is in USD with 18 decimals)
  const totalAUM = summaries.reduce((acc, vault) => {
    return acc + (vault && vault.totalFundValue ? Number(vault.totalFundValue) : 0)
  }, 0)
  
  // Add as USDT (standard for misrepresented tokens in DeFiLlama)
  return {
    tether: totalAUM / 1e18
  }
}

module.exports = {
  methodology: "Tracks Infinite Trading treasury holdings across multiple chains (Ethereum, Arbitrum, Optimism, Polygon, Base) including direct multisig balances and dHEDGE managed vault AUM (~$300k).",
  misrepresentedTokens: true,
  optimism: {
    tvl: async (api) => {
      await getTreasuryTVL(api)
      const dhedgeTVL = await getDhedgeVaultsTVL(api)
      if (dhedgeTVL) api.addUSDValue(dhedgeTVL.tether)
      return api.getBalances()
    },
  },
  ethereum: {
    tvl: getTreasuryTVL,
  },
  arbitrum: {
    tvl: async (api) => {
      await getTreasuryTVL(api)
      const dhedgeTVL = await getDhedgeVaultsTVL(api)
      if (dhedgeTVL) api.addUSDValue(dhedgeTVL.tether)
      return api.getBalances()
    },
  },
  polygon: {
    tvl: async (api) => {
      await getTreasuryTVL(api)
      const dhedgeTVL = await getDhedgeVaultsTVL(api)
      if (dhedgeTVL) api.addUSDValue(dhedgeTVL.tether)
      return api.getBalances()
    },
  },
  base: {
    tvl: async (api) => {
      await getTreasuryTVL(api)
      const dhedgeTVL = await getDhedgeVaultsTVL(api)
      if (dhedgeTVL) api.addUSDValue(dhedgeTVL.tether)
      return api.getBalances()
    }
  },
}
