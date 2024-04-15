const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const config = require("./config");


async function voterProxyBalances(masterWombat, voterProxy, wmxLocker, wmx, wom, veWom, api) {
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
      params: [underlyingTokens[index], '' + 1e18],
    })),
  })
  underlyingAmounts
    .map((a, i) => {
      api.add(underlyingTokens[i], a!==null? a.amount * masterWombatVoterProxyBalances[i].amount / 1e18: 0)
    })
}

async function veWomBalance(masterWombat, voterProxy, wmxLocker, wmx, wom, veWom, api) {
  const womBal = await api.call({ abi: 'erc20:balanceOf', target: veWom, params: voterProxy })
  api.add(veWom, womBal)
}

async function veWomBalanceCrutch(masterWombat, voterProxy, wmxLocker, wmx, wom, veWom, api) {
    const womBal = await api.call({ abi: 'erc20:balanceOf', target: veWom, params: voterProxy })
    api.add(wom, womBal)
}

async function tvl(masterWombat, voterProxy, wmxLocker, wmx, wom, veWom, api) {
    await veWomBalance(masterWombat, voterProxy, wmxLocker, wmx, wom, veWom, api)
    await voterProxyBalances(masterWombat, voterProxy, wmxLocker, wmx, wom, veWom, api)
    await veWomBalanceCrutch(masterWombat, voterProxy, wmxLocker, wmx, wom, veWom, api)
}

module.exports = {
  methodology:
    "TVL of Wombex Finance consists of Wombat LP tokens staked in MasterWombat, WOM tokens locked in veWOM, and WMX tokens locked in Wombex Vote Lock contract. Until proper accounting of veWom can be established on account of it lacking a listed price, veWom is added to the tally of WOM.",
};

Object.keys(config).forEach((chain) => {
    const { masterWombat, voterProxy, wmxLocker, wmx, wom, veWom } = config[chain];
    module.exports[chain] = {
        tvl: tvl.bind(null, masterWombat, voterProxy, wmxLocker, wmx, wom, veWom),
        staking: staking(wmxLocker, wmx)
    }
})