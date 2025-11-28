const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const BigNumber = require("bignumber.js");
const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

const contracts = {
  ethereum: {
    usp: '0x97cCC1C046d067ab945d3CF3CC6920D3b1E54c88', // USP
    factory: {
      block: 22938055,
      address: '0x59aabdad8fdabd227cc71543b128765f93906626',
    },
    credits: [
      "0xf6223C567F21E33e859ED7A045773526E9E3c2D5", // Fasanara Yield vault,
      "0x4462eD748B8F7985A4aC6b538Dfc105Fce2dD165", // Bastion 
      "0x14B8E918848349D1e71e806a52c13D4e0d3246E0", // Adaptive Frontier
      "0x433D5B175148dA32Ffe1e1A37a939E1b7e79be4d", // FalconX
    ],
  },
  polygon: {
    credits: [
      '0xF9E2AE779a7d25cDe46FccC41a27B8A4381d4e52' // Bastion CV
    ]
  },
  optimism: {
    credits: [
      "0xD2c0D848aA5AD1a4C12bE89e713E70B73211989B", // FalconX
    ],
    excludeVaultsAfterTimestamp: {
      '0xD2c0D848aA5AD1a4C12bE89e713E70B73211989B': 1756936799
    }
  },
  arbitrum: {
    credits: [
      "0x3919396Cd445b03E6Bb62995A7a4CB2AC544245D" // Bastion Credit Vault
    ]
  }
}

async function getUspTvl(api, usp, credits){
  const [
    queueAddress,
    uspTotalSupply,
  ] = await Promise.all([
    'address:queue',
    'uint256:totalSupply',
  ].map(abi => api.call({ abi, target: usp })))

  const yieldSources = await api.call({
    abi: 'function getAllYieldSources() view returns (tuple(address token, address source, address vaultToken, uint256 maxCap, tuple(bytes4 method, uint8 methodType)[] allowedMethods, uint8 vaultType)[] yieldSources)',
    target: queueAddress,
    chain: api.chain
  })

  // Exclude amount deposited in credit vaults to avoid double-counting
  const creditsSources = yieldSources.filter( s => credits.map( addr => addr.toLowerCase() ).includes(s.source.toLowerCase()) )
  const yieldSourcesAmounts = await Promise.all(creditsSources.map( s => api.call({ abi: 'function getCollateralsYieldSourceScaled(address) returns (uint256)', target: queueAddress, params: [s.source] }) ))
  const uspTvl = yieldSourcesAmounts.reduce( (acc, amount) => {
    return BigNumber(acc).minus(amount)
  }, uspTotalSupply)

  return uspTvl/1e12
  
}

async function tvl(api) {
  const { usp = undefined, credits = [], excludeVaultsAfterTimestamp = [], factory } = contracts[api.chain]
  const balances = {}
  const ownerTokens = {}
  const blacklistedTokens = []
  const trancheTokensMapping = {}

  // Add USP Total Supply
  if (usp){
    const uspUnderlying = ADDRESSES[api.chain].USDC
    const scaledUSPTvl = await getUspTvl(api, usp, credits)
    sdk.util.sumSingleBalance(balances, uspUnderlying, scaledUSPTvl, api.chain)
  }

  // Add credit vaults from factory
  if (factory) {
    const logs = await getLogs({
      api,
      target: factory.address,
      topics: ['0x22d236b886e994153ab139e04b213355a725846284c6018c26c6af0988bd58d7'],
      eventAbi: 'event CreditVaultDeployed(address proxy)',
      onlyArgs: true,
      fromBlock: factory.block,
    })

    logs.forEach( l => {
      if (!credits.find( addr => addr.toLowerCase() === l.proxy.toLowerCase())){
        credits.push(l.proxy)
      }
    })
  }
  
  // Exclude credit vaults by block
  const creditsFiltered = credits.filter( addr => {
    const foundTimestamp = excludeVaultsAfterTimestamp[addr]
    return !foundTimestamp || !api.timestamp || Number(foundTimestamp)>Number(api.timestamp)
  } )

  const [
    cdoToken,
    aatrances,
    bbtrances,
    aaprices,
    bbprices,
  ] = await Promise.all([
    "address:token",
    "address:AATranche",
    "address:BBTranche",
    "uint256:priceAA",
    "uint256:priceBB"
  ].map(abi => api.multiCall({ abi, calls: creditsFiltered })))

  blacklistedTokens.push(...creditsFiltered)
  blacklistedTokens.push(...aatrances)
  blacklistedTokens.push(...bbtrances)

  // Load tokens decimals
  const callsDecimals = [...cdoToken].map( t => ({ target: t, params: [] }) )
  const decimalsResults = await api.multiCall({abi: 'erc20:decimals', calls: callsDecimals})
  const tokensDecimals = decimalsResults.reduce( (tokensDecimals, decimals, i) => {
    const call = callsDecimals[i]
    tokensDecimals[call.target] = decimals
    return tokensDecimals
  }, {})

  const [creditsStrategies, creditsTokens] = await Promise.all(['address:strategy', 'address:token'].map( abi => api.multiCall({ abi, calls: creditsFiltered })))

  // Get CDOs contract values
  const [
    contractValue,
    pendingWithdraws,
    pendingInstantWithdraws
  ] = await Promise.all([
    api.multiCall({ abi: 'uint256:getContractValue', calls: creditsFiltered }),
    api.multiCall({ abi: 'uint256:pendingWithdraws', calls: creditsStrategies }),
    api.multiCall({ abi: 'uint256:pendingInstantWithdraws', calls: creditsStrategies }),
  ])

  // Count pending withdraws
  pendingWithdraws.map( (amount, i) => sdk.util.sumSingleBalance(balances, creditsTokens[i], amount, api.chain))
  pendingInstantWithdraws.map( (amount, i) => sdk.util.sumSingleBalance(balances, creditsTokens[i], amount, api.chain))

  cdoToken.forEach((token, i) => {
    const tokenDecimals = tokensDecimals[token] || 18
    trancheTokensMapping[aatrances[i]] = {
      token,
      decimals: tokenDecimals,
      price: BigNumber(aaprices[i]).div(`1e${tokenDecimals}`).toFixed()
    }
    trancheTokensMapping[bbtrances[i]] = {
      token,
      decimals: tokenDecimals,
      price: BigNumber(bbprices[i]).div(`1e${tokenDecimals}`).toFixed()
    }

    // Get CDOs underlying tokens balances
    sdk.util.sumSingleBalance(balances, token, contractValue[i], api.chain)
  })

  const trancheTokensBalancesCalls = []

  // Process tranche tokens BY balances
  if (trancheTokensBalancesCalls.length){
    const trancheTokensBalancesResults = await api.multiCall({ abi: 'erc20:balanceOf', calls: trancheTokensBalancesCalls })
    trancheTokensBalancesResults.forEach( (trancheTokenBalance, i) => {
      const trancheToken = trancheTokensBalancesCalls[i].target
      const decimals = trancheTokensMapping[trancheToken].decimals
      const trancheTokenPrice = trancheTokensMapping[trancheToken].price || 1
      const underlyingToken = trancheTokensMapping[trancheToken].token
      const underlyingTokenBalance = BigNumber(trancheTokenBalance || 0).times(trancheTokenPrice).div(`1e18`).times(`1e${decimals}`).toFixed(0)
      balances[underlyingToken] = BigNumber(balances[underlyingToken] || 0).plus(underlyingTokenBalance)
    })
  }
  return sumTokens2({ api, balances, ownerTokens, blacklistedTokens, })
}

module.exports = {
  hallmarks: [],
};

Object.keys(contracts).forEach(chain => {
  module.exports[chain] = { tvl }
})