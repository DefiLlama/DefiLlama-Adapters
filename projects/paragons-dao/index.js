const sdk = require('@defillama/sdk');

const stakingContract = '0x51e025cb3ee0b99a84f7fb80994198281e29aa3e';
const stakedToken = '0xeff2A458E464b07088bDB441C21A42AB4b61e07E';

const tokenAbi = {
  name: 'balanceOf',
  inputs: [
    {
      type: 'address',
      name: 'account',
    },
  ],
  outputs: [
    {
      type: 'uint256',
      name: '',
    },
  ],
  stateMutability: 'view',
  type: 'function',
};

async function stakingTvl(_, _b, _cb, { api }) {
  const balances = {};

  // Fetch the balance of staked tokens in the staking contract
  const { output: stakedBalance } = await sdk.api.abi.call({
    abi: tokenAbi,
    target: stakedToken,
    params: [stakingContract],
    chain: 'base' 
  });

  // Add the staked token balance to the balances object
  sdk.util.sumSingleBalance(balances, `base:${stakedToken}`, stakedBalance);

  return balances;
}

module.exports = {
  methodology: 'TVL of ParagonsDAO corresponds to the staking of PDT tokens in the staking contract.',
  start: 18751707, // Update with the block or timestamp when staking started
  base: {
    tvl: async () => ({}), // leave protocol TVL as empty
    staking: stakingTvl,
  },
};
