const sdk = require('@defillama/sdk');
const vaultAbi = require('./vaultAbi.json');
const usdfAbi = require('./usdfAbi.json');

const USDF_TOKEN_CONTRACT = '0x51acB1ea45c1EC2512ae4202B9076C13016dc8aA';
const FRACTAL_VAULT_CONTRACT = '0x3eB82f2eD4d992dc0Bed328214A0907250f4Ec82';
const ONE_MWEI = 1000000;


async function tvl (timestamp, block) {

    const usdfTotalSupply = (await sdk.api.usdfAbi.call({
        block,
        target: USDF_TOKEN_CONTRACT,
        abi: abi['totalSupply']
    })).output;

    const usdfTokenPrice = (await sdk.api.vaultAbi.call({
        block,
        target: FRACTAL_VAULT_CONTRACT,
        abi: abi['getTokenPrice']
    })).output;

    totalTvl = (usdfTotalSupply/ONE_MWEI) * (usdfTokenPrice/ONE_MWEI);
    
    return totalTvl;
}

module.exports = {
    ethereum: {
      methodology: "USDF is minted when USDC is deposited into the Fractal Vault. TVL = totalSupply * usdfPrice.",
      tvl,
    }
  }


