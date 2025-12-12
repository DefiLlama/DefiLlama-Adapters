const ADDRESSES = require('../helper/coreAssets.json')

const ALCUM_COPPER_VAULT = '0x84735270aE4F8fe9ae15652f676ecb524ea480Ab'

async function tvl(api) {
  const totalSupply = await api.call({
    target: ALCUM_COPPER_VAULT, 
    abi: 'erc20:totalSupply',
  });

  const valueInUsdc = await api.call({
    target: ALCUM_COPPER_VAULT,
    abi: 'function getXcupPriceInToken(address token, uint256 xcupAmount) view returns (uint256)',
    params: [ADDRESSES.ethereum.USDC, totalSupply],
  });

  api.add(ADDRESSES.ethereum.USDC, valueInUsdc);
}

module.exports = {
  methodology: "TVL represents the total USDC value of all xCUP tokens in the Alcum Copper Vault.",
  ethereum: {
    tvl,
  }
};