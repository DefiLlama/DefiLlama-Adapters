const abi = require("./abi.json");
const { staking } = require("../helper/staking");

const masterWombat = "0x489833311676B566f888119c29bd997Dc6C95830";
const voterProxy = "0xE3a7FB9C6790b02Dcfa03B6ED9cda38710413569";
const wmxLocker = "0xd4E596c0d5aD06724f4980ff9B73438FEb1504EE";
const wmx = '0xa75d9ca2a0a1d547409d82e1b06618ec284a2ced';
const wom = '0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1';
const veWom = '0x3DA62816dD31c56D9CdF22C6771ddb892cB5b0Cc';

async function voterProxyBalances(api) {
  let masterWombatPoolInfos = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: masterWombat })

  const proxyBalanceCalls = masterWombatPoolInfos.map((_, i) => ({ target: masterWombat, params: [i, voterProxy] }))
  let masterWombatVoterProxyBalances = await api.multiCall({
    abi: abi.userInfo,
    calls: proxyBalanceCalls,
  })
  
  masterWombatPoolInfos = masterWombatPoolInfos.filter((_, i) => +masterWombatVoterProxyBalances[i].amount > 0)
  masterWombatVoterProxyBalances = masterWombatVoterProxyBalances.filter((_, i) => +masterWombatVoterProxyBalances[i].amount > 0)
  const lpTokens = masterWombatPoolInfos.map((pool) => pool.lpToken);
  const lpPools = await api.multiCall({ abi: abi.pool, calls: lpTokens, });
  const underlyingTokens = await api.multiCall({ abi: abi.underlyingToken, calls: lpTokens, })

  const underlyingAmounts = await api.multiCall({
    abi: abi.quotePotentialWithdraw,
    calls: lpPools.map((pool, index) => ({
      target: pool,
      params: [getUnderlying(pool, index), '' + 1e18],
    })),
  })

  function getUnderlying(pool, index) {
    if (pool.toLowerCase() === '0x2Ea772346486972E7690219c190dAdDa40Ac5dA4'.toLowerCase()) return '0x2170ed0880ac9a755fd29b2688956bd959f933f8'
    return underlyingTokens[index]
  }
  underlyingAmounts
    .map((a, i) => {
      api.add(underlyingTokens[i], a.amount * masterWombatVoterProxyBalances[i].amount / 1e18)
    })
}

async function veWomBalance(api) {
  const womBal = await api.call({ abi: 'erc20:balanceOf', target: veWom, params: voterProxy })
  api.add(veWom, womBal)
}

async function tvl(timestamp, ethereumBlock, chainBlocks, { api }) {
  await veWomBalance(api)
  await voterProxyBalances(api)
}

module.exports = {
  methodology:
    "TVL of Wombex Finance consists of Wombat LP tokens staked in MasterWombat, WOM tokens locked in veWOM, and WMX tokens locked in Wombex Vote Lock contract.",
  bsc: {
    tvl,
    staking: staking(wmxLocker, wmx),
  },
};
