const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')

const GRAPH_URLS = {
  ethereum: sdk.graph.modifyEndpoint('https://subgraph.satsuma-prod.com/a912521dd162/templedao/origami-mainnet/api'), // ethereum
  arbitrum: sdk.graph.modifyEndpoint('https://subgraph.satsuma-prod.com/a912521dd162/templedao/origami-arbitrum/api'), // arbitrum
  berachain: sdk.graph.modifyEndpoint('https://subgraph.satsuma-prod.com/a912521dd162/templedao/origami-berachain/api'), // berachain
}

module.exports = {
  doublecounted: true,
}

Object.keys(GRAPH_URLS).forEach(chain => {
  module.exports[chain] = { 
    tvl,
    borrowed
  }
})

function vaultsOfKind(investmentVaults, vaultKind) {
  return investmentVaults.filter(vault => !!vault.vaultKinds.find(v => v === vaultKind)).map(v => v.id)
}

async function processLeveragedVaults(api, vaults) {
  const [levReserveTokens, assetsAndLiabilities] = await Promise.all([
    api.multiCall({ calls: vaults, abi: 'address:reserveToken', permitFailure: true }),
    api.multiCall({ abi: 'function assetsAndLiabilities() external view returns (uint256 assets,uint256 liabilities,uint256 ratio)', calls: vaults, permitFailure: true })
  ])

  vaults.forEach((_vault, i) => {
    const levReserveToken = levReserveTokens[i]
    const assetsAndLiability = assetsAndLiabilities[i]
    if(!levReserveToken || !assetsAndLiability) return
    const levBal = assetsAndLiability.assets - assetsAndLiability.liabilities
    api.addToken(levReserveToken, levBal)
  })
}

async function processRepricingVaults(api, vaults) {
  const [decimals, supplies, reserves, rawNonLevTokens] = await Promise.all([
    api.multiCall({ abi: 'uint8:decimals', calls: vaults, permitFailure: true }),
    api.multiCall({ abi: 'uint256:totalSupply', calls: vaults, permitFailure: true }),
    api.multiCall({ abi: 'uint256:reservesPerShare', calls: vaults, permitFailure: true }),
    api.multiCall({ abi: 'address:reserveToken', calls: vaults, permitFailure: true })
  ])

  await Promise.all(vaults.map(async (_vault, i) => {
    const decimal = decimals[i]
    const supply = supplies[i]
    const reserve = reserves[i]
    const rawNonLevToken = rawNonLevTokens[i]
    if (!decimals || !supply || !reserve || !rawNonLevToken) return
    const nonLevToken = await api.call({ abi: 'address:baseToken', target: rawNonLevToken })
    const bal = reserve * supply / 10 ** decimal
    api.addToken(nonLevToken, bal)
  }))
}

async function processErc4626Vaults(api, vaults) {
  const [assets, totalAssets] = await Promise.all([
    api.multiCall({ abi: 'address:asset', calls: vaults, permitFailure: false }),
    api.multiCall({ abi: 'uint256:totalAssets', calls: vaults, permitFailure: false })
  ])

  await Promise.all(vaults.map(async (_vault, i) => {
    api.addToken(assets[i], totalAssets[i])
  }))
}

async function tvl(api) {
  const { investmentVaults } = await cachedGraphQuery('origami/' + api.chain, GRAPH_URLS[api.chain], '{ investmentVaults { id vaultKinds } }')

  await processLeveragedVaults(api, vaultsOfKind(investmentVaults, 'LEVERAGE'))
  await processRepricingVaults(api, vaultsOfKind(investmentVaults, 'REPRICING'))
  await processErc4626Vaults(api, vaultsOfKind(investmentVaults, 'ERC4626'))
}

async function borrowed(api) {
  const { investmentVaults } = await cachedGraphQuery('origami/' + api.chain, GRAPH_URLS[api.chain], '{ investmentVaults { id vaultKinds } }')
  const vaults = vaultsOfKind(investmentVaults, 'LEVERAGE')

  // Retrieve the token balance of the underlying debt token
  const managers = await api.multiCall({ calls: vaults, abi: 'address:manager', permitFailure: true })
  const borrowLends = await api.multiCall({ calls: managers, abi: 'address:borrowLend', permitFailure: true })
  const [borrowTokens, borrowAmounts] = await Promise.all([
    await api.multiCall({ calls: borrowLends, abi: 'address:borrowToken', permitFailure: true }),
    await api.multiCall({ calls: borrowLends, abi: 'address:debtBalance', permitFailure: true })
  ])

  vaults.forEach((_vault, i) => {
    const debtToken = borrowTokens[i]
    const debtAmount = borrowAmounts[i]
    if(!debtToken || !debtAmount) return
    api.addToken(debtToken, debtAmount)
  })
}
