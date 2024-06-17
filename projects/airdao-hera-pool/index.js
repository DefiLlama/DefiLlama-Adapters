const sdk = require('@defillama/sdk');

const POOL_ADDRESS = '0x0E051C8C1cd519d918DB9b631Af303aeC85266BF';

async function tvl(api) {
  const balances = {};

  const totalStake = await api.call({abi: 'uint256:totalStake', target: POOL_ADDRESS})

  sdk.util.sumSingleBalance(balances, 'amber', totalStake / 10**18)

  return balances;
}

module.exports = {
  methodology: `TVL counts deposits made to Hera pool on AirDAO.`,
  misrepresentedTokens: true,
  timetravel: false,
  airdao: {
    tvl
  }
}
