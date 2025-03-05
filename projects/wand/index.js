const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk');

const ip = ADDRESSES.null
const vIP = '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD'

async function transformVIP2IP(api, vipBalance) {
  const verioComponentSelector = '0x20Cb9DCb6FC306c31325bdA6221AA5e067B9Da51'
  const verioStakePool = await api.call({ abi: 'address:stakePool', target: verioComponentSelector })
  const ipBalance = await api.call({ 
    abi: 'function calculateIPWithdrawal(uint256) view returns (uint256)', 
    target: verioStakePool, 
    params: [vipBalance] 
  })
  return ipBalance
}

async function styTvl(api) {
  const protocols = [
    '0x555ad3261c0eD6119Ab291b8dC383111d83C67c7'
  ]

  const tokensAndOwners = []
  let totalVipBalance = 0n

  for (const protocol of protocols) {
    const assets = await api.call({ abi: 'address[]:assetTokens', target: protocol })

    const vaults = (await api.multiCall({ abi: 'function getVaultAddresses(address) view returns (address[])', calls: assets, target: protocol })).flat()
    const assetBals = await api.multiCall({ abi: 'uint256:assetBalance', calls: vaults, permitFailure: true })
    
    // Track VIP balances separately
    for (let i = 0; i < assets.length; i++) {
      if (assets[i].toLowerCase() === vIP.toLowerCase()) {
        // Accumulate VIP balances
        totalVipBalance += BigInt(assetBals[i] || 0)
      } else {
        // Add other asset balances normally
        api.add(assets[i], assetBals[i] || 0)
      }
    }

    // Add redeem pool balances
    const epochInfoAbi = 'function epochInfoById(uint256 epochId) public view returns (uint256 epochId, uint256 startTime, uint256 duration, address redeemPool, address stakingBribesPool, address adhocBribesPool)'
    try {
      const epochInfos = await api.fetchList({ lengthAbi: 'epochIdCount', itemAbi: epochInfoAbi, target: vaults[0], startFromOne: true, groupedByInput: true })
      
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i]
        const infos = epochInfos[i] || []
        
        for (const { redeemPool } of infos) {
          if (redeemPool && redeemPool !== '0x0000000000000000000000000000000000000000') {
            if (asset.toLowerCase() === vIP.toLowerCase()) {
              // For VIP tokens in redeem pools, we'll check their balance and add it to totalVipBalance
              const vipInRedeemPool = await api.call({
                abi: 'function balanceOf(address) view returns (uint256)',
                target: vIP,
                params: [redeemPool]
              }).catch(() => 0)
              
              totalVipBalance += BigInt(vipInRedeemPool || 0)
            } else {
              // Other tokens are added normally
              tokensAndOwners.push([asset, redeemPool])
            }
          }
        }
      }
    } catch (e) {
      console.log("Error fetching epoch info:", e.message)
    }
  }

  // Convert accumulated VIP to IP
  if (totalVipBalance > 0n) {
    try {
      const ipEquivalent = await transformVIP2IP(api, totalVipBalance)
      // Add the IP equivalent to the balances
      api.add(ip, ipEquivalent)
      // console.log(`Converted ${totalVipBalance.toString()} VIP to ${ipEquivalent.toString()} IP`)
    } catch (e) {
      console.error("Failed to convert VIP to IP:", e)
    }
  }

  // Get final balances with token owners
  const balances = await api.sumTokens({ tokensAndOwners })
  
  // Make sure VIP isn't counted in the final balances
  if (balances[vIP]) {
    delete balances[vIP]
  }
  
  return balances
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