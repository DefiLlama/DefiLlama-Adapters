const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const styTreasury = '0x54c56e149f6d655aa784678057d1f96612b0cf1a'
const styProtocol = '0x555ad3261c0eD6119Ab291b8dC383111d83C67c7'

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
  let ownerTokens = []
  const tokens = await api.multiCall({  abi: 'address[]:assetTokens', calls: [styProtocol]})
  
  // Create array of tokens excluding VIP
  const nonVipTokens = []
  let hasVip = false
  
  tokens[0].forEach(token => {
    if (token.toLowerCase() === vIP.toLowerCase()) {
      hasVip = true
    } else {
      nonVipTokens.push(token)
    }
  })
  
  // Add non-VIP tokens to ownerTokens
  nonVipTokens.forEach(token => ownerTokens.push([token, styTreasury]))

  // Handle VIP conversion if present
  if (hasVip) {
    try {
      // Get VIP balance in the treasury
      const vipBalance = await api.call({
        abi: 'function balanceOf(address) view returns (uint256)',
        target: vIP,
        params: [styTreasury]
      })
      
      if (vipBalance && BigInt(vipBalance) > 0n) {
        // Convert VIP to IP
        const ipEquivalent = await transformVIP2IP(api, vipBalance)
        
        // Add IP equivalent to balances
        api.add(ip, ipEquivalent)
      }
    } catch (e) {
      console.error("Failed to convert VIP to IP in treasury:", e)
    }
  }
  
  // Get balances with ownerTokens (non-VIP tokens)
  const balances = await api.sumTokens({ ownerTokens })
  
  // Make sure VIP isn't counted in final balances
  if (balances[vIP]) {
    delete balances[vIP]
  }
  
  return balances
}

module.exports =  {
  blast: {
    tvl: sumTokensExport({
      owners: [
        "0x462bd2d3c020f6986c98160bc4e189954f49634b", // treasury
      ],
      tokens: [ 
        ADDRESSES.null, // $ETH
        ADDRESSES.blast.USDB,  // $USDB
        ADDRESSES.blast.weETH  // weETH
      ]
    })
  },
  sty: { tvl: styTvl }
}

// module.exports = treasuryExports(config)