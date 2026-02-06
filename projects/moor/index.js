const { sumTokens, query } = require("../helper/chain/fuel")
const { rigAbi } = require('../the-rig/abi')

const stFuelAssetId = '0x5505d0f58bea82a052bc51d2f67ab82e9735f0a98ca5d064ecb964b8fd30c474'
const fuelAssetId = '0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82'
const rigContract = '0x2181f1b8e00756672515807cab7de10c70a9b472a4a9b1b6ca921435b0a1f49b'

async function tvl(api) {
  const contractId = '0xd7795099227cc0b9dc5872d29ca2b10691d9db6bd45853a6bb532e68dd166ce3'
  const stakingContract = '0x79d2a26b57974e2b2e4d39dc189e818fcc86399337406dec65165b189a6f1ed7'

  const balances = await sumTokens({ api, owners: [contractId, stakingContract] })

  // Convert stFUEL to its FUEL equivalent using The Rig's redemption rate
  const stFuelKey = 'fuel:' + stFuelAssetId
  if (balances[stFuelKey]) {
    const stFuelBalance = balances[stFuelKey]
    delete balances[stFuelKey]
    const redemptionRate = await query({ contractId: rigContract, abi: rigAbi, method: 'get_sanitized_price' })
    const fuelKey = 'fuel:' + fuelAssetId
    balances[fuelKey] = (Number(balances[fuelKey]) || 0) + stFuelBalance * redemptionRate / 1e9
  }

  return balances
}

module.exports = {
  methodology: 'Counts tokens deposited in Moor protocol contracts, converting stFUEL to its FUEL equivalent via The Rig redemption rate.',
  fuel: { tvl },
  timetravel: false,
}
