const abi = {
    "userInfo": "function userInfo(uint256, address) view returns (uint128 amount, uint128 factor, uint128 rewardDebt, uint128 pendingWom)",
    "poolLength": "uint256:poolLength",
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint96 allocPoint, address rewarder, uint256 sumOfFactors, uint104 accWomPerShare, uint104 accWomPerFactorShare, uint40 lastRewardTimestamp)",
    "pool": "address:pool",
    "lockedSupply": "uint256:lockedSupply",
    "underlyingToken": "address:underlyingToken",
    "quotePotentialWithdraw": "function quotePotentialWithdraw(address token, uint256 liquidity) view returns (uint256 amount, uint256 fee)"
  };
const { staking } = require("../helper/staking");
const config = {
  bsc: {
        masterWombat: "0x489833311676B566f888119c29bd997Dc6C95830",
        voterProxy: "0xE3a7FB9C6790b02Dcfa03B6ED9cda38710413569",
        wmxLocker:  "0xd4E596c0d5aD06724f4980ff9B73438FEb1504EE",
        wmx: '0xa75d9ca2a0a1d547409d82e1b06618ec284a2ced',
        wom: '0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1',
        veWom: '0x3DA62816dD31c56D9CdF22C6771ddb892cB5b0Cc',
  },
  arbitrum: {
      masterWombat: "0x62A83C6791A3d7950D823BB71a38e47252b6b6F4",
      voterProxy: "0x24D2f6be2bF9cdf3627f720cf09D4551580C1eC1",
      wmxLocker: "0xdD76cE773ce8Bd29d32c8389197e98a6e4C1C1A5",
      wmx: '0x5190f06eacefa2c552dc6bd5e763b81c73293293',
      wom: '0x7b5eb3940021ec0e8e463d5dbb4b7b09a89ddf96',
      veWom: '0x488B34F704a601DAeEf14135146a3dA79F2d3EFC',
  },
};


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