const sdk = require('@defillama/sdk')
const getTokenPrice = {"inputs":[],"name":"getTokenPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
const USDF_TOKEN_CONTRACT = '0x51acB1ea45c1EC2512ae4202B9076C13016dc8aA';
const FRACTAL_VAULT_CONTRACT = '0x3eB82f2eD4d992dc0Bed328214A0907250f4Ec82';

async function tvl(timestamp, block) {
  const { output: totalSupply } = await sdk.api.erc20.totalSupply({ target: USDF_TOKEN_CONTRACT, block }) 
  const { output: price } = await sdk.api.abi.call({ target: FRACTAL_VAULT_CONTRACT, block, abi: getTokenPrice }) 

  return {
    'usd-coin': totalSupply * price / 1e12
  }
}

module.exports = {
  ethereum: {
    methodology: "USDF is minted when USDC is deposited into the Fractal Vault. TVL = totalSupply * usdfPrice.",
    tvl,
  }
}


