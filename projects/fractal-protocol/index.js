const sdk = require('@defillama/sdk');

const FRACTAL_VAULT_CONTRACT_ETH = '0x3EAa4b3e8967c02cE1304C1EB35e8C5409838DFC';
const USDF_ETH = '0x51acB1ea45c1EC2512ae4202B9076C13016dc8aA';

const FRACTAL_VAULT_CONTRACT_ARB = '0x80e1a981285181686a3951B05dEd454734892a09'
const USDF_ARB = '0xae48b7C8e096896E32D53F10d0Bf89f82ec7b987'

const abis = {
  getTokenPrice: 'uint256:getTokenPrice',
};

const getEthTvl = async (timestamp, ethBlock) => {
  try {

    const { output: usdfTotalSupply } = await sdk.api.erc20.totalSupply({
      target: USDF_ETH,
      block: ethBlock,
    });

    const { output: usdfPrice } = await sdk.api.abi.call({
      target: FRACTAL_VAULT_CONTRACT_ETH,
      abi: abis.getTokenPrice,
      block: ethBlock,
    });

    return {
      tether: (usdfTotalSupply / 1e6) * (usdfPrice / 1e6)
    }

  } catch (error) {
    console.error('Error calculating ETH TVL:', error);
    throw error;
  }
};

const getArbTvl = async (_, _b, { arbitrum: block }) => {

  try {

    const chain = 'arbitrum'

    const { output: usdfTotalSupply } = await sdk.api.erc20.totalSupply({
      target: USDF_ARB,
      block: block,
      chain: chain
    });

    const { output: usdfPrice } = await sdk.api.abi.call({
      target: FRACTAL_VAULT_CONTRACT_ARB,
      abi: abis.getTokenPrice,
      block: block,
      chain: chain
    });

    return {
      tether: (usdfTotalSupply / 1e6) * (usdfPrice / 1e6)
    }

  } catch (error) {
    console.error('Error calculating ARB TVL:', error);
    throw error;
  }
};

module.exports = {
  ethereum: {
    tvl: getEthTvl
  },
  arbitrum: {
    tvl: getArbTvl
  }
};
