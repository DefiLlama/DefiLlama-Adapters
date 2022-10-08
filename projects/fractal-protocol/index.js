const sdk = require('@defillama/sdk')
const getTotalDeposited = {"inputs":[],"name":"getTotalDeposited","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
const USDF_TOKEN_CONTRACT = '0x51acB1ea45c1EC2512ae4202B9076C13016dc8aA';
const FRACTAL_VAULT_CONTRACT = '0x3EAa4b3e8967c02cE1304C1EB35e8C5409838DFC';

async function tvl(timestamp, block) {
  const { output: total } = await sdk.api.abi.call({ target: FRACTAL_VAULT_CONTRACT, block, abi: getTotalDeposited }) 

  return {
    'usd-coin': total / 1e6 
  }
}

module.exports = {
  ethereum: {
    methodology: "Total deposited UDSC into the fractal vault",
    tvl,
  }
}


