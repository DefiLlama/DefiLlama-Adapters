const sdk = require("@defillama/sdk");

const SUPR = '0x3390108E913824B8eaD638444cc52B9aBdF63798'
const ROLLUX_SUPR_STAKING = '0x400aDCba906EA6E87FEC276f0E0C0857F71A85F2'

const calculateRolluxStaking = async function (timestamp, block, chainBlocks, { chain = "rollux" } = {}) {
  const balances = {};
  
  const totalSupply = await sdk.api.abi.call({
    abi: 'erc20:totalSupply',
    target: ROLLUX_SUPR_STAKING,
    chain: chain,
    block: chainBlocks[chain]
  });

  sdk.util.sumSingleBalance(balances, `${chain}:${SUPR}`, totalSupply.output);

  return balances;
}

module.exports = {
  rollux: {
    tvl: calculateRolluxStaking
  },
};
