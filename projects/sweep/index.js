const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json');
const SWEEP_ADDRESS = '0xB88a5Ac00917a02d82c7cd6CEBd73E2852d43574';

const config = {
  ethereum: {
    fromBlock: 18017036,
  },
  arbitrum: {
    fromBlock: 124179091,
  },
  optimism: {
    fromBlock: 110684392,
  }
};

async function tvl(_a, _b, _c, { api }) {
  const balances = {}
  const USDC_ADDRESS = ADDRESSES[api.chain].USDC;
  const minters = await api.multiCall({ abi: 'address[]:getMinters', calls: [SWEEP_ADDRESS] });

  const balanceOfCalls = minters[0].map((minter) => {
    return api.multiCall({
      abi: 'function balanceOf(address) external view returns(uint256)',
      calls: [{ target: USDC_ADDRESS, params: minter }]
    });
  });

  const assetValueCalls = minters[0].map((minter) => {
    return api.multiCall({ abi: 'uint256:assetValue', calls: [minter] });
  });

  const valueCalls = await Promise.all([...balanceOfCalls, ...assetValueCalls]);
  const totalBalance = valueCalls.reduce((sum, value) => sum + parseInt(value[0]), 0);

  sdk.util.sumSingleBalance(balances, `${api.chain}:${USDC_ADDRESS}`, totalBalance);

  return balances;
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
