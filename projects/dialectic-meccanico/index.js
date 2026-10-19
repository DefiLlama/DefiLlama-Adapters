const ADDRESSES = require('../helper/coreAssets.json')
const { getCuratorTvl } = require('../helper/curators')

const DIALECTIC_MORPHO_OWNER = '0x8c9918AbE972F3c8A478e9A5912ECdc0a2e0BA0c'
const SR_ROY_USDC = '0xcD9f5907F92818bC06c9Ad70217f089E190d2a32'
const ROY_WST_ETH = '0x41ce72e04d349eb957bdc373baa9c69207032c56'

const STRATEGY_TYPE_CROSSCHAIN = 2
const getStrategiesAbi = 'function getStrategies() view returns (address[])'
const strategyTypeAbi = 'function strategyType() view returns (uint8)'
const getMakinaMachineAbi = 'function getMakinaMachine() view returns (address)'
const hubCaliberAbi = 'function hubCaliber() view returns (address)'
const convertToAssetsAbi = 'function convertToAssets(uint256 shares) view returns (uint256 assets)'

async function resolveStrategies(api, vault) {
  const strategies = await api.call({ abi: getStrategiesAbi, target: vault })
  if (!strategies.length) return []

  const types = await api.multiCall({ abi: strategyTypeAbi, calls: strategies })
  const crosschain = strategies.filter((_, i) => Number(types[i]) === STRATEGY_TYPE_CROSSCHAIN)
  const selfCustody = strategies.filter((_, i) => Number(types[i]) !== STRATEGY_TYPE_CROSSCHAIN)

  if (!crosschain.length) return selfCustody

  const machines = await api.multiCall({ abi: getMakinaMachineAbi, calls: crosschain })
  const calibers = await api.multiCall({ abi: hubCaliberAbi, calls: machines })

  return [...selfCustody, ...calibers]
}

async function addRoyWstEth(api) {
  const totalAssets = await api.call({
    abi: 'uint256:totalAssets',
    target: ROY_WST_ETH,
  })

  api.add(ADDRESSES.ethereum.WSTETH, totalAssets)

  const strategies = await resolveStrategies(api, ROY_WST_ETH)
  if (!strategies.length) return

  const shares = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: strategies.map(strategy => ({
      target: SR_ROY_USDC,
      params: [strategy],
    })),
  })

  const calls = strategies
    .map((_, i) => ({
      target: SR_ROY_USDC,
      params: [shares[i]],
    }))
    .filter((_, i) => BigInt(shares[i]) > 0n)

  if (!calls.length) return

  const nestedUsdc = await api.multiCall({
    abi: convertToAssetsAbi,
    calls,
  })

  nestedUsdc.forEach(usdc => {
    api.add(ADDRESSES.ethereum.USDC, -BigInt(usdc))
  })
}

async function tvl(api) {
  await getCuratorTvl(api, {
    morphoVaultOwners: [DIALECTIC_MORPHO_OWNER],
    erc4626: [SR_ROY_USDC],
  })

  await addRoyWstEth(api)

  return api.getBalances()
}

module.exports = {
  doublecounted: true,
  start: '2026-04-17',
  methodology: 'Counts assets managed by Dialectic Meccanico across Senior Royco USDC, Royco ETH and Dialectic Morpho vaults. Royco ETH is added from its on-chain totalAssets() and its nested srRoyUSDC position is subtracted using the same strategy-holder resolution used by the Royco V2 adapter, preventing internal double counting. The curator listing is marked double counted because the same assets are also represented in the underlying protocol TVLs.',
  ethereum: { tvl },
}
