const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { ethers: { BigNumber } } = require("ethers")
const { staking } = require("../helper/staking");
const abi = require('./abi.json');
const voterProxy = '0xe96c48C5FddC0DC1Df5Cf21d68A3D8b3aba68046';
const masterWombat = '0x489833311676B566f888119c29bd997Dc6C95830';
const quoLocker = "0xe76eEA460d02663275962a99529700E132EF526c";
const quo = '0x08b450e4a48C04CDF6DB2bD4cf24057f7B9563fF';
const wom = '0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1';
const veWom = '0x3DA62816dD31c56D9CdF22C6771ddb892cB5b0Cc';
const chain = 'bsc';

async function voterProxyBalances(api) {
  const poolLength = await api.call({ abi: abi.poolLength, target: masterWombat, })

  const masterWombatPoolInfos = await api.multiCall({ abi: abi.poolInfo, target: masterWombat, calls: Array.from(Array(+poolLength).keys()), });
  const masterWombatVoterProxyBalances = await api.multiCall({ abi: abi.userInfo, target: masterWombat, calls: Array.from(Array(+poolLength).keys()).map((pid) => ({ params: [pid, voterProxy] })), });

  const lpTokenTargets = masterWombatPoolInfos.map((pool) => pool.lpToken);
  const lpPools = await api.multiCall({ abi: abi.pool, calls: lpTokenTargets, });
  const underlyingTokens = await api.multiCall({ abi: abi.underlyingToken, calls: lpTokenTargets, });

  const underlyingAmounts = await api.multiCall({
    abi: abi.quotePotentialWithdraw,
    calls: lpPools.map((pool, index) => {
      return {
        target: pool,
        params: [underlyingTokens[index], masterWombatVoterProxyBalances[index].amount],
      };
    }),
    permitFailure: true,
  });
  return underlyingAmounts
    .map((a, i) => {
      if (+masterWombatVoterProxyBalances[i].amount === 0) return;
      if (underlyingTokens[i].toLowerCase() === ADDRESSES.bsc.ankrBNB.toLowerCase()) return; // disable aBNBc (ankr bnb)
      if (a)
        api.add(underlyingTokens[i], a.amount)
    })
}

async function tvl(timestamp, ethereumBlock, chainBlocks, { api }) {
  api.add(wom, await api.call({ abi: 'erc20:balanceOf', target: veWom, params: [voterProxy], }))
  await voterProxyBalances(api)
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
