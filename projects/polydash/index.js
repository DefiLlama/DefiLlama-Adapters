// Polydash on Robinhood Chain: Polypad launchpad, tokenized fund vaults, and
// permissionless staking pools.
//
// TVL is ETH in launch contracts and commit vaults, plus ETH, WETH and
// mandate-list tokens in fund vaults, plus the stake-token balance of factory
// pools. Pools that stake POLYDASH are reported under `staking`. Reward tokens
// other than the stake token, virtual ETH on bonding curves, and Uniswap liquidity
// after a launch graduates are excluded (graduated liquidity is already
// tracked by the Uniswap adapters).
const ADDRESSES = require('../helper/coreAssets.json')

const POLYDASH = '0x319525528f42167ef7fc18b77b889958080568e4'
const WETH = ADDRESSES.robinhood.WETH

const stakingFactories = [
  '0x0aAEa47d2e7303EC5a809062eafa59e7F011D857', // v1
  '0x904b8F5d95B593b5F4a6Dbb116b58e1d5CBe93f0', // v2
  '0x4C87aff7009DE1c58E052FEe202349a10b28Be9c', // v3 (Nov 2026)
]

const launchFactories = [
  '0xfDfD0A095966c8B56639f7eAa13f4B0188Fc08c2', // current
  '0x2C84cFCD8d283EF750E09Fbed735d67F67845dB2', // earlier
]

const commitVaults = [
  '0xF013bF17D511E2f65D0dA4Bd320948646F567Ae4',
  '0x8f125c9ec7acd52b9cd39f2a7441085559d84104',
]

// Phase 1a vaults hold only ETH (no mandateAssetCount). Later factories do.
const fundFactoriesEthOnly = [
  '0x6c0094BA60DaA0467Daf81f4D576d74DD3a08878', // FundFactory (phase 1a)
]
const fundFactoriesWithAssets = [
  '0xd3c6ae470c25989cC8d2876c1855fB570B98894E', // FundFactoryInvest (phase 2)
  '0xb9BA453677A6b2C49290CfD4D0713502Ec6bF82B', // FundFactoryPhase3
  '0xe50Da719947E83f316977d9c425DF95672E7B27e', // FundFactoryPhase3V2 (phase 6, agent API default)
  '0xB5251BaC3CFE2A057B7703D4477Bf80f10B8154B', // FundFactoryPhase3V3
]

const listAbi = (lengthAbi, itemAbi) => ({ lengthAbi, itemAbi })
const launchList = listAbi('uint256:allLaunchesLength', 'function allLaunches(uint256) view returns (address)')
const fundList = listAbi('uint256:allFundsLength', 'function allFunds(uint256) view returns (address)')
const poolList = listAbi('uint256:poolsLength', 'function allPools(uint256) view returns (address)')

async function fetchAll(api, targets, abis) {
  const out = []
  for (const target of targets)
    out.push(...await api.fetchList({ ...abis, target }))
  return out
}

async function getPools(api) {
  const pools = await fetchAll(api, stakingFactories, poolList)
  if (!pools.length) return []
  const tokens = await api.multiCall({ abi: 'address:stakeToken', calls: pools })
  return pools.map((pool, i) => [tokens[i], pool])
}

const isPolydash = ([token]) => token.toLowerCase() === POLYDASH

async function getFundVaults(api, factories) {
  const funds = await fetchAll(api, factories, fundList)
  if (!funds.length) return []
  return api.multiCall({ abi: 'address:vault', calls: funds })
}

async function tvl(api) {
  const pools = await getPools(api)
  await api.sumTokens({ tokensAndOwners: pools.filter((pool) => !isPolydash(pool)) })

  const launches = await fetchAll(api, launchFactories, launchList)
  const vaultsEthOnly = await getFundVaults(api, fundFactoriesEthOnly)
  const vaultsWithAssets = await getFundVaults(api, fundFactoriesWithAssets)

  const tokens = [ADDRESSES.null, WETH]
  if (vaultsWithAssets.length) {
    const counts = await api.multiCall({ abi: 'uint256:mandateAssetCount', calls: vaultsWithAssets })
    const assetCalls = []
    vaultsWithAssets.forEach((vault, i) => {
      const n = Number(counts[i])
      for (let j = 0; j < n; j++) assetCalls.push({ target: vault, params: [j] })
    })
    if (assetCalls.length) {
      const assets = await api.multiCall({ abi: 'function mandateAssets(uint256) view returns (address)', calls: assetCalls })
      assets.forEach((t) => {
        if (t && t.toLowerCase() !== POLYDASH) tokens.push(t)
      })
    }
  }

  await api.sumTokens({
    owners: [...launches, ...commitVaults, ...vaultsEthOnly, ...vaultsWithAssets],
    tokens: [...new Set(tokens.map((t) => t.toLowerCase()))],
  })
}

async function staking(api) {
  const pools = await getPools(api)
  return api.sumTokens({ tokensAndOwners: pools.filter(isPolydash) })
}

module.exports = {
  methodology: 'TVL is ETH held by Polypad launch contracts and commit vaults, plus ETH, WETH and mandate-list tokens (except POLYDASH) held by Polydash tokenized fund vaults, plus the stake-token balance of pools from the staking factories, which includes rewards a pool holds in its own stake token. Pools that stake POLYDASH are counted as staking. Reward tokens other than the stake token, virtual ETH on bonding curves, and Uniswap liquidity after graduation are excluded.',
  robinhood: { tvl, staking },
}
