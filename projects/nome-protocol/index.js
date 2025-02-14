// DEX
const BALANCER_VAULT_ADDRESS = '0x4Be03f781C497A489E3cB0287833452cA9B9E80B'

// POOLS
const REWARDS_POOLS_NOME_HOMEY_LP = '0xf4399d583d8dad39399ea6a99ca218290595aedc'
const REWARDS_POOLS_USDbr_HONEY_LP = '0x422bd07acb1f7fa86682fcf211554ca500d0be78'
const LIQUIDE_BOARDROOM = '0x50caa9627a940bcd4d5f3c3ed231252425af50cf'
const STAB_FUND = '0xff491a00b12be29413a2b29c2499cac50e4ec35a'

// TOKENS
const NOME_TOKEN = '0xfaf4c16847bd0ebac546c49a9c9c6b81abd4b08c'
const USDbr_TOKEN = '0x6d4223dae2a8744a85a6d44e97f3f61679f87ee6'
const HONEY_TOKEN = '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce'

// LP POOLS
const NOME_HOMEY_LP = '0x54270bea720a79db0a34645053b02740ebcbfad5'
const USDbr_HONEY_LP = '0xb1f0c3a875512191eb718b305f192dc19564f513'


async function tvl(api) {
  // Pool REWARDS_POOLS_NOME_HOMEY_LP
  let balTokenSupply = await api.call({ abi: 'uint256:getActualSupply', target: NOME_HOMEY_LP })
  let poolId = await api.call({ abi: 'function getPoolId() view returns (bytes32)', target: NOME_HOMEY_LP })
  const nomeHoneyLpBalance = await api.call({ abi: 'erc20:balanceOf', target: NOME_HOMEY_LP, params: REWARDS_POOLS_NOME_HOMEY_LP, })
  const [tokens1, bals1] = await api.call({ abi: 'function getPoolTokens(bytes32) view returns (address[], uint256[],uint256)', target: BALANCER_VAULT_ADDRESS, params: poolId })
  const balLPRatio1 = nomeHoneyLpBalance / balTokenSupply
  tokens1.forEach((v, i) => {
    if (v.toLowerCase() === NOME_HOMEY_LP.toLowerCase()) return;
    api.add(v, bals1[i] * balLPRatio1)
  })

  // Pool REWARDS_POOLS_USDbr_HONEY_LP
  balTokenSupply = await api.call({ abi: 'uint256:getActualSupply', target: USDbr_HONEY_LP })
  poolId = await api.call({ abi: 'function getPoolId() view returns (bytes32)', target: USDbr_HONEY_LP })
  const usdbrHoneyLpBalance = await api.call({ abi: 'erc20:balanceOf', target: USDbr_HONEY_LP, params: REWARDS_POOLS_USDbr_HONEY_LP, })
  const [tokens2, bals2] = await api.call({ abi: 'function getPoolTokens(bytes32) view returns (address[], uint256[],uint256)', target: BALANCER_VAULT_ADDRESS, params: poolId })
  const balLPRatio2 = usdbrHoneyLpBalance / balTokenSupply
  tokens2.forEach((v, i) => {
    if (v.toLowerCase() === USDbr_HONEY_LP.toLowerCase()) return;
    api.add(v, bals2[i] * balLPRatio2)
  })

  // NOME staking
  const nomeStaked = await api.call({ abi: 'erc20:balanceOf', target: NOME_TOKEN, params: LIQUIDE_BOARDROOM, })
  api.add(NOME_TOKEN, nomeStaked)

  // StabFund
  const stabFundHoneyBalance = await api.call({ abi: 'erc20:balanceOf', target: HONEY_TOKEN, params: STAB_FUND, })
  const stabFundUsdbrBalance = await api.call({ abi: 'erc20:balanceOf', target: USDbr_TOKEN, params: STAB_FUND, })
  api.add(HONEY_TOKEN, stabFundHoneyBalance)
  api.add(USDbr_TOKEN, stabFundUsdbrBalance)
}

module.exports = {
  berachain: { 
    tvl,
  }
}