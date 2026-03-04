const ADDRESSES = require('../helper/coreAssets.json')
const contracts = {
  KAIA : {
    stKAIA: '0x42952B873ed6f7f0A7E4992E2a9818E3A9001995',
    rstKAIA: '0xd05fCB2d4c427232C3b36a33E21a4F23810A298F',
    LAIR: '0xD70C7D511560493C79DF607076fB863f5c8A50b0',
    nodeController: '0x7949597f453592B782EC9036Af27d63Ed9774b2d',
    restakingManager: '0x66611Ba2aa5deB46e6138aD21a202b40ecE5b6AB',
  },
  BERA: {
    WBERA: ADDRESSES.berachain.WBERA,
    LAIR: '0xf3530788DEB3d21E8fA2c3CBBF93317FB38a0D3C',
    LrBGT: '0x66611Ba2aa5deB46e6138aD21a202b40ecE5b6AB',
    iBGT: '0xac03caba51e17c86c921e1f6cbfbdc91f8bb2e6b',
    lairBGTManager: '0x381E9DC031D2667BB61d4Ab61e64D520Bbd7bFfC',
    lairBGTManagerHelper: '0xfc3Da0822fE3127334B95Ea3661060B957379c82',
    infraredIBGTVault: '0x75F3Be06b02E235f6d0E7EF2D462b29739168301',
    infraredWBERALAIRVault: '0x6583e71778A3d275B8A27f1252A125f7a6F875D1',
    kodiakBERALAIRLp: '0x9f6cf7aCb2F16f7d906EeeCB0a6020a5Cf91A41d'
  },
  SOMNIA: {
    nodeController: '0x0FdCe181fde9582E6CA9Acf95577E04DAC573a43'
  }
}

async function kaia_tvl(api) {
  const tvl = await api.call({ target: contracts.KAIA.nodeController, abi: "uint256:getTotalClaimable" })
  api.addGasToken(tvl)
}

async function kaia_staking(api) {
  const rstKAIATotalSupply = await api.call({ target: contracts.KAIA.rstKAIA, abi: "erc20:totalSupply" })
  const lairPairRate = await api.call({ target: contracts.KAIA.restakingManager, abi: "uint256:pairRate" })
  const restakedLairAmount = rstKAIATotalSupply * lairPairRate / (10 ** 18)
  api.add(contracts.KAIA.LAIR, restakedLairAmount)
}

async function getBeraAssets(api) {
  const lrBGTTotalSupply = await api.call({ target: contracts.BERA.LrBGT, abi: "erc20:totalSupply" })

  const tokenContracts = [{
    token: contracts.BERA.LrBGT,
    manager: contracts.BERA.lairBGTManager,
    helper: contracts.BERA.lairBGTManagerHelper,
    bgtVault: contracts.BERA.infraredIBGTVault,
    lpVault: contracts.BERA.infraredWBERALAIRVault,
    bgtToken: contracts.BERA.iBGT,
    lpToken: contracts.BERA.kodiakBERALAIRLp,
    token0: contracts.BERA.WBERA,
    token1: contracts.BERA.LAIR,
  }]

  const predicted = await api.multiCall({
    abi: 'function predictedUnStakeAmount(address,address,address,address,address,address,address,address,uint256) view returns (uint256,uint256)',
    calls: tokenContracts.map(item => ({
      target: contracts.BERA.lairBGTManagerHelper,
      params: [
        item.manager,
        item.token,
        item.bgtVault,
        item.lpVault,
        item.bgtToken,
        item.lpToken,
        item.token0,
        item.token1,
        lrBGTTotalSupply,
      ]
    })),
  })
  const bgtAmounts = predicted.map(([bgtAmount]) => bgtAmount)
  const lpAmounts  = predicted.map(([, lpAmount]) => lpAmount)

  const pairAmounts = await api.multiCall({
    abi: "function lpPairTokenAmount(address,uint256) view returns (uint256,uint256)",
    calls: tokenContracts.map((item, idx) => ({
      target: contracts.BERA.lairBGTManagerHelper,
      params: [item.lpToken, lpAmounts[idx]],
    })),
  })

  const results = tokenContracts.map((c, i) => {
    const [token0Amount, token1Amount] = pairAmounts[i]
    return {
      bgtToken: c.bgtToken,
      token0: c.token0,
      token1: c.token1,
      bgtAmount: bgtAmounts[i],
      token0Amount,
      token1Amount,
    }
  })

  return results
}

async function bera_tvl(api) {
  const items = await getBeraAssets(api)
  for (const item of items) {
    api.add(item.bgtToken, item.bgtAmount)
    api.add(item.token0, item.token0Amount)
  }
}

async function bera_staking(api) {
  const items = await getBeraAssets(api)
  for (const item of items) {
    api.add(item.token1, item.token1Amount)
  }
}

async function somnia_tvl(api) {
  const toalStakingAmount = await api.call({ target: contracts.SOMNIA.nodeController, abi: "uint256:totalStakingAmount" })
  const totalUnstakingAmount = await api.call({ target: contracts.SOMNIA.nodeController, abi: "uint256:totalUnStakingAmount" })
  api.addGasToken(toalStakingAmount - totalUnstakingAmount)
}

module.exports = {
  klaytn:  { tvl: kaia_tvl, staking: kaia_staking },
  berachain:{ tvl: bera_tvl, staking: bera_staking },
  somnia:{ tvl: somnia_tvl },
}