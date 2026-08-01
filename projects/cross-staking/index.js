const ADDRESSES = require('../helper/coreAssets.json')
const { addCrossToken } = require('../helper/chain/cross');

const STAKING_CONTRACT = '0x000000068122d9bB43B4BCF5497A10EdfA9F5E93';
const CROSS_NATIVE_ADDRESS = ADDRESSES.null;


async function staking(api) {
  const balances = api.getBalances();

  const totalStaked = await api.call({
    abi: 'function totalStaked() external view returns (uint256)',
    target: STAKING_CONTRACT,
  });

  addCrossToken(balances, CROSS_NATIVE_ADDRESS, totalStaked.toString());
  return balances;
}

module.exports = {
  methodology: 'Native CROSS amount staked to CROSS Staking contract',
  cross: {
    tvl: () => ({}),
    staking,
  },
};
