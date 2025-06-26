const { query } = require("../helper/chain/fuel")
const { rigAbi } = require('./abi');

const rigContract = "0x2181f1b8e00756672515807cab7de10c70a9b472a4a9b1b6ca921435b0a1f49b";
const stFuelAssetId = { bits: "0x5505d0f58bea82a052bc51d2f67ab82e9735f0a98ca5d064ecb964b8fd30c474" };

const fuelAssetId = "0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82";

async function tvl(api) {
  let redemptionRate = await query({ contractId: rigContract, abi: rigAbi, method: 'get_sanitized_price' });
  const totalSupply = await query({ contractId: rigContract, abi: rigAbi, method: 'total_supply', params: [stFuelAssetId] });

  const fuelStaked = totalSupply * redemptionRate / 1e9
  api.add(fuelAssetId, fuelStaked);
}

module.exports = {
  methodology: 'Fetches the total supply of stFuel and the redemption rate to calculate the total value of staked Fuel',
  fuel: { tvl }
}
