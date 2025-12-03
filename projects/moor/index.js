const { sumTokens, query } = require("../helper/chain/fuel")
const { rigAbi } = require('./abi')

const rigContract = "0x2181f1b8e00756672515807cab7de10c70a9b472a4a9b1b6ca921435b0a1f49b"
const stFuelAssetId = "0x5505d0f58bea82a052bc51d2f67ab82e9735f0a98ca5d064ecb964b8fd30c474"
const fuelAssetId = "0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82"

async function tvl(api) {
  const contractId = '0xd7795099227cc0b9dc5872d29ca2b10691d9db6bd45853a6bb532e68dd166ce3'

  const balances = await sumTokens({ api, owner: contractId })
  
  // Convert stFUEL to FUEL equivalent using redemption rate
  if (balances[`fuel:${stFuelAssetId}`]) {
    const redemptionRate = await query({ 
      contractId: rigContract, 
      abi: rigAbi, 
      method: 'get_sanitized_price' 
    })
    
    const stFuelBalance = balances[`fuel:${stFuelAssetId}`]
    const fuelEquivalent = stFuelBalance * redemptionRate / 1e9
    
    delete balances[`fuel:${stFuelAssetId}`]
    balances[`fuel:${fuelAssetId}`] = (balances[`fuel:${fuelAssetId}`] || 0) + fuelEquivalent
  }
  
  return balances
}

module.exports = {
  fuel: { tvl },
  timetravel: false,
}
