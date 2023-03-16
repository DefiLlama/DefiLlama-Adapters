const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { ethers: {BigNumber}, utils } = require("ethers")

const masterWombat = "0x489833311676B566f888119c29bd997Dc6C95830";
const voterProxy = "0xE3a7FB9C6790b02Dcfa03B6ED9cda38710413569";
const wmxLocker = "0xd4E596c0d5aD06724f4980ff9B73438FEb1504EE";
const wmx = '0xa75d9ca2a0a1d547409d82e1b06618ec284a2ced';
const wom = '0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1';
const veWom = '0x3DA62816dD31c56D9CdF22C6771ddb892cB5b0Cc';

const chain = "bsc";

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
        params: [underlyingTokens.output[index].output, utils.parseEther('1')],
      };
    }),
    chain,
  });
  return underlyingAmounts.output
    .map((a, i) => {
      if (masterWombatVoterProxyBalances.output[i].output.amount === '0') return;
      const oneUnit = utils.parseEther('1')
      return ({amount: BigNumber.from(a.output.amount).mul(BigNumber.from(masterWombatVoterProxyBalances.output[i].output.amount)).div(oneUnit), token: underlyingTokens.output[i].output})
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
      "TVL of Wombex Finance consists of Wombat LP tokens staked in MasterWombat, WOM tokens locked in veWOM, and WMX tokens locked in Wombex Vote Lock contract.",
  bsc: {
    tvl,
    staking: staking(
      wmxLocker,
      wmx,
      chain
    ),
  },
};
