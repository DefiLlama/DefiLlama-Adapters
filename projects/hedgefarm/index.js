const sdk = require("@defillama/sdk")

const vaults = [
  '0xdE4133f0CFA1a61Ba94EC64b6fEde4acC1fE929E',  // ALPHA1_V1_CONTRACT
  '0x60908a71fbc9027838277f9f98e458bef2a201da',  // ALPHA1_V2_CONTRACT
]
const v2Vaults = [
  '0x3C390b91Fc2f248E75Cd271e2dAbF7DcC955B1A3',  // ALPHA2_CONTRACT
]

const ALPHA1_ABI = "uint256:totalBalance";
const ALPHA2_ABI = "uint256:getLastUpdatedModulesBalance";

async function tvl(api) {
  const [tokenv1, tokenv2, balv1, balv2] = await Promise.all([
    api.multiCall({ abi: 'address:token', calls: vaults }),
    api.multiCall({ abi: 'address:baseToken', calls: v2Vaults, }),
    api.multiCall({ abi: ALPHA1_ABI, calls: vaults, }),
    api.multiCall({ abi: ALPHA2_ABI, calls: v2Vaults, }),
  ])
  const balances = {};
  tokenv1.forEach((v, i) => sdk.util.sumSingleBalance(balances, v, balv1[i], api.chain))
  tokenv2.forEach((v, i) => sdk.util.sumSingleBalance(balances, v, balv2[i], api.chain))

  return balances;
}

module.exports = {
  methodology: 'Gets the total balance in the Alpha #1 contract from IOU total supply and price per share and in the Smart Farmooor (Alpha #2) from the total balance.',
  avax: {
    tvl,
  }
};