const { getCuratorTvl } = require("../helper/curators")
const sdk = require("@defillama/sdk")
const { util: { blocks: { getBlocks } } } = require("@defillama/sdk")

async function debugVaults() {
  const configs = {
    ethereum: {
      morphoVaultOwners: [
        '0x354C92aF243d53A24feb3dFF20372Af7b7c47478',
      ],
    },
    arbitrum: {
      morphoVaultOwners: [
        '0x354C92aF243d53A24feb3dFF20372Af7b7c47478',
      ],
    },
  }
  
  const unixTimestamp = Math.round(Date.now() / 1000) - 60
  let chainBlocks = {}
  try {
    const res = await getBlocks(unixTimestamp, ["ethereum", "arbitrum"])
    chainBlocks = res.chainBlocks
  } catch (e) {
    console.log("Warning: Could not get blocks:", e.message)
  }
  
  console.log("\n=== ETHEREUM VAULTS DISCOVERED ===\n")
  const ethApi = new sdk.ChainApi({ 
    chain: "ethereum", 
    block: chainBlocks.ethereum, 
    timestamp: unixTimestamp,
    storedKey: "ethereum"
  })
  ethApi.api = ethApi
  ethApi.storedKey = "ethereum"
  
  // Use the curator helper to get vaults
  const { getLogs2 } = require("../helper/cache/getLogs")
  const { ABI, MorphoConfigs } = require("../helper/curators/configs")
  
  function isOwner(owner, owners) {
    for (const item of owners) {
      if (String(item).toLowerCase() === String(owner).toLowerCase()) {
        return true
      }
    }
    return false
  }
  
  // Manually replicate getMorphoVaults logic
  let morphoVaults = []
  for (const factory of MorphoConfigs[ethApi.chain].vaultFactories) {
    const vaultOfOwners = (
      await getLogs2({
        api: ethApi,
        eventAbi: ABI.morpho.CreateMetaMorphoEvent,
        target: factory.address,
        fromBlock: factory.fromBlock,
      })
    ).filter(log => isOwner(log.initialOwner, configs.ethereum.morphoVaultOwners)).map((log) => log.metaMorpho)
    morphoVaults = morphoVaults.concat(vaultOfOwners)
  }
  
  console.log(`Found ${morphoVaults.length} Morpho vaults:`)
  for (const vault of morphoVaults) {
    console.log(`  - ${vault}`)
  }
  
  // Get assets and totalAssets for discovered vaults
  const ERC4626_ABI = {
    asset: "function asset() view returns (address)",
    totalAssets: "function totalAssets() view returns (uint256)",
  }
  
  const ERC20_ABI = {
    decimals: "function decimals() view returns (uint8)",
    symbol: "function symbol() view returns (string)",
  }
  
  if (morphoVaults.length > 0) {
    const assets = await ethApi.multiCall({
      abi: ERC4626_ABI.asset,
      calls: morphoVaults,
      permitFailure: true,
    })
    
    const totalAssets = await ethApi.multiCall({
      abi: ERC4626_ABI.totalAssets,
      calls: morphoVaults,
      permitFailure: true,
    })
    
    const symbols = await ethApi.multiCall({
      abi: ERC20_ABI.symbol,
      calls: assets.filter(a => a),
      permitFailure: true,
    })
    
    const decimals = await ethApi.multiCall({
      abi: ERC20_ABI.decimals,
      calls: assets.filter(a => a),
      permitFailure: true,
    })
    
    console.log("\nVault Details:")
    for (let i = 0; i < morphoVaults.length; i++) {
      if (assets[i] && totalAssets[i]) {
        const symbol = symbols[assets.indexOf(assets[i])] || "UNKNOWN"
        const decimal = decimals[assets.indexOf(assets[i])] || 18
        const amount = Number(totalAssets[i]) / 10 ** decimal
        console.log(`  ${morphoVaults[i]}:`)
        console.log(`    Asset: ${assets[i]} (${symbol})`)
        console.log(`    Total Assets: ${amount.toLocaleString()}`)
      }
    }
  }
  
  console.log("\n=== ARBITRUM VAULTS DISCOVERED ===\n")
  const arbApi = new sdk.ChainApi({ 
    chain: "arbitrum", 
    block: chainBlocks.arbitrum, 
    timestamp: unixTimestamp,
    storedKey: "arbitrum"
  })
  arbApi.api = arbApi
  arbApi.storedKey = "arbitrum"
  
  let arbMorphoVaults = []
  for (const factory of MorphoConfigs[arbApi.chain].vaultFactories) {
    const vaultOfOwners = (
      await getLogs2({
        api: arbApi,
        eventAbi: ABI.morpho.CreateMetaMorphoEvent,
        target: factory.address,
        fromBlock: factory.fromBlock,
      })
    ).filter(log => isOwner(log.initialOwner, configs.arbitrum.morphoVaultOwners)).map((log) => log.metaMorpho)
    arbMorphoVaults = arbMorphoVaults.concat(vaultOfOwners)
  }
  
  console.log(`Found ${arbMorphoVaults.length} Morpho vaults:`)
  for (const vault of arbMorphoVaults) {
    console.log(`  - ${vault}`)
  }
}

debugVaults().catch(console.error)

