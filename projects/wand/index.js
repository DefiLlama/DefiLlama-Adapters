const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

async function styTvl(api) {
  const protocols = [
    '0x555ad3261c0eD6119Ab291b8dC383111d83C67c7',
    '0xB5eD29BCf541aebcb3ee179cb590d92D3d9F9445',
    '0xE092612505661721053fA22b2D40fD6ae1eA87c2'
  ]

  const tokensAndOwners = []
  const AIDaUSDC = "0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42".toLowerCase()
  const canonicalUSDC = ADDRESSES.sty.USDC_e

  for (const protocol of protocols) {
    const assets = await api.call({ abi: 'address[]:assetTokens', target: protocol })

    // Get vault arrays for each asset
    const vaultArrays = await api.multiCall({ 
      abi: 'function getVaultAddresses(address) view returns (address[])', 
      calls: assets, 
      target: protocol 
    })
    
    // Create expanded arrays to match vaults with their corresponding assets
    const expandedAssets = []
    const vaults = []
    
    // For each asset, map it to its vaults
    vaultArrays.forEach((vaultArray, assetIndex) => {
      const asset = assets[assetIndex]
      vaultArray.forEach(vault => {
        expandedAssets.push(asset)
        vaults.push(vault)
      })
    })
    
    // Now expandedAssets[i] corresponds to vaults[i]
    const assetBals = await api.multiCall({ abi: 'uint256:assetBalance', calls: vaults, permitFailure: true })
    
    // Add balances with correct asset-vault mapping and convert AIDaUSDC
    for (let i = 0; i < vaults.length; i++) {
      const asset = expandedAssets[i]
      let balance = assetBals[i] || 0
      
      if (asset.toLowerCase() === AIDaUSDC && balance > 0) {
        // Convert AIDaUSDC to actual USDC using convertToAssets
        try {
          const convertedBalance = await api.call({
            abi: 'function convertToAssets(uint256) view returns (uint256)',
            target: asset,
            params: [balance]
          })
          api.add(canonicalUSDC, convertedBalance)
        } catch (e) {
          console.log("Error converting AIDaUSDC:", e.message)
          // Fallback to original balance if conversion fails
          api.add(asset, balance)
        }
      } else {
        api.add(asset, balance)
      }
    }

    // Add redeem pool balances
    const epochInfoAbi = 'function epochInfoById(uint256 epochId) public view returns (uint256 epochId, uint256 startTime, uint256 duration, address redeemPool, address stakingBribesPool, address adhocBribesPool)'
    try {
      for (let i = 0; i < vaults.length; i++) {
        const asset = expandedAssets[i]
        const vault = vaults[i]

        const epochInfos = await api.fetchList({ 
          lengthAbi: 'epochIdCount', 
          itemAbi: epochInfoAbi, 
          target: vault, 
          startFromOne: true, 
          groupedByInput: true 
        })

        const infos = epochInfos || []
        
        for (const { redeemPool } of infos) {
          if (redeemPool && redeemPool !== ADDRESSES.null) {
            // For redeem pools, we'll handle AIDaUSDC conversion in sumTokens
            if (asset.toLowerCase() === AIDaUSDC) {
              // Get AIDaUSDC balance in redeem pool and convert it
              try {
                const poolBalance = await api.call({
                  abi: 'function balanceOf(address) view returns (uint256)',
                  target: asset,
                  params: [redeemPool]
                })
                if (poolBalance > 0) {
                  const convertedBalance = await api.call({
                    abi: 'function convertToAssets(uint256) view returns (uint256)',
                    target: asset,
                    params: [poolBalance]
                  })
                  api.add(canonicalUSDC, convertedBalance)
                }
              } catch (e) {
                console.log("Error converting AIDaUSDC in redeem pool:", e.message)
                tokensAndOwners.push([asset, redeemPool])
              }
            } else {
              tokensAndOwners.push([asset, redeemPool])
            }
          }
        }
      }
    } catch (e) {
      console.log("Error fetching epoch info:", e.message)
    }
  }

  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  blast: {
    tvl: sumTokensExport({ 
      owners: [
        '0xDC3985196D263E5259AB946a4b52CEDCBaDC1390', // $ETH vault's token pot
        '0xfD7D3d51b081FBeA178891839a9FEd5ca7896bDA', // $ETH vault's pty pool buy low
        '0x2F5007df87c043552f3c6b6e5487B2bDc92F0232', // $ETH vault's pty pool sell high
        '0x05c061126A82DC1AfF891b9184c1bC42D380a2ff',  // $USDB vault's token pot
        '0x7063ea2dBa364aCd9135752Da5395ac7CD12313D', // $ETH V2 vault's token pot
        '0x3ee083573FceA8c015dcbfC7a51777B5770cbe64', // $ETH V2 vault's pty pool buy low
        '0x39db7083C97d2C298C1A88fD27b0bd1C9c9f6fa8', // $ETH V2 vault's pty pool sell high
        '0x565e325B7197d6105b0Ee74563ea211Cc838e2c3',  // $USDB V2 vault's token pot
        '0x4A084b06eFdB44e9fB26Eac29334E4808BA65A32', // $weETH plain vault
      ],
      tokens: [
        ADDRESSES.null,  // $ETH
        ADDRESSES.blast.USDB,  // $USDB
        ADDRESSES.blast.weETH  // weETH
      ],
    }),
  },
  sty: { tvl: styTvl }
};