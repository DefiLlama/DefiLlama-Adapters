const sdk = require('@defillama/sdk');
const { ethers: {BigNumber} } = require("ethers")
const { staking } = require("../helper/staking");
const abi = require('./abi.json');
const voterProxy = '0xe96c48C5FddC0DC1Df5Cf21d68A3D8b3aba68046';
const masterWombat = '0xE2C07d20AF0Fb50CAE6cDD615CA44AbaAA31F9c8';
const quoLocker = "0xe76eEA460d02663275962a99529700E132EF526c";
const quo = '0x08b450e4a48C04CDF6DB2bD4cf24057f7B9563fF';
const wom = '0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1';
const veWom = '0x3DA62816dD31c56D9CdF22C6771ddb892cB5b0Cc';
const chain = 'bsc';

async function voterProxyBalances(block) {
  const poolLength = await sdk.api.abi.call({
    abi: abi.poolLength,
    target: masterWombat,
    params: [],
    block,
    chain
  }).then(l => parseInt(l.output.toString()));

  const masterWombatPoolInfos = await sdk.api.abi.multiCall({
    block,
    abi: abi.poolInfo,
    calls: Array.from(Array(poolLength).keys()).map((pid) => ({ target: masterWombat, params: [pid] })),
    chain,
  });

  const masterWombatVoterProxyBalances = await sdk.api.abi.multiCall({
    block,
    abi: abi.userInfo,
    calls: Array.from(Array(poolLength).keys()).map((pid) => ({ target: masterWombat, params: [pid, voterProxy] })),
    chain,
  });

  const lpTokenTargets = masterWombatPoolInfos.output.map((pool) => ({ target: pool.output.lpToken, params: [] }));

  const lpPools = await sdk.api.abi.multiCall({
    block,
    abi: abi.pool,
    calls: lpTokenTargets,
    chain,
  });

  const underlyingTokens = await sdk.api.abi.multiCall({
    block,
    abi: abi.underlyingToken,
    calls: lpTokenTargets,
    chain,
  });

  const underlyingAmounts = await sdk.api.abi.multiCall({
    block,
    abi: abi.quotePotentialWithdraw,
    calls: lpPools.output.map((pool, index) => {
      return {
        target: pool.output,
        params: [underlyingTokens.output[index].output, masterWombatVoterProxyBalances.output[index].output.amount],
      };
    }),
    chain,
  });
  return underlyingAmounts.output
    .map((a, i) => {
      if (masterWombatVoterProxyBalances.output[i].output.amount === '0') return;
      return ({amount: a.output.amount, token: underlyingTokens.output[i].output})
    }).filter(i => i);
}

async function veWomBalance(block) {
  return sdk.api.erc20.balanceOf({
    owner: voterProxy,
    target: veWom,
    block,
    chain,
  }).then(s => s.output);
}

async function tvl(timestamp, ethereumBlock, chainBlocks) {
  const block = chainBlocks[chain];

  let balances = {};
  balances[`${chain}:${wom}`] = await veWomBalance(block);

  const vpBalances = await voterProxyBalances(block);
  vpBalances.forEach(b => {
    if (balances[`${chain}:${b.token}`]) {
      balances[`${chain}:${b.token}`] = BigNumber.from(balances[`${chain}:${b.token}`]).add(BigNumber.from(b.amount)).toString();
    } else {
      balances[`${chain}:${b.token}`] = b.amount;
    }
  });

  return balances;
}

module.exports = {
  methodology:
      "TVL of Quoll Finance consists of Wombat LP tokens staked in MasterWombat, WOM tokens locked in veWOM, and Quoll tokens locked in QUO Vote Lock contract.",
  bsc: {
    tvl,
    staking: staking(
      quoLocker,
      quo,
      chain
    ),
  },
};
