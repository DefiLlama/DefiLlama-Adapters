const { ethers } = require('ethers')
const { getLogs } = require('../helper/cache/getLogs')

const BGBTC = '0x31011317764e097b28d159a8145b92bfa453f606'
const WBTC = 'ethereum:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
const vaultCreatedTopic = ethers.id('VaultCreated(address,address,address,(string,string),(address,address,address),address,string)')
const vaultCreatedEvent = 'event VaultCreated(address indexed vault, address indexed owner, address hooks, (string name, string symbol) erc20Params, (address feeCalculator, address feeToken, address feeRecipient) feeVaultParams, address beforeTransferHook, string description)'

const factories = {
  ethereum: {
    address: '0x29722cC9a1cACff4a15914F9bC274B46F3b90B4F',
    fromBlock: 22583788,
  },
  base: {
    address: '0x29722cC9a1cACff4a15914F9bC274B46F3b90B4F',
    fromBlock: 30834355,
  },
  morph: {
    address: '0xA735FaF51AE8BD0637b8468828dC83E2C24A8E60',
    fromBlock: 24054994,
  },
  arbitrum: {
    address: '0xd1883062629157Ff6Eae51ca355aCA4f52d2BD4E',
    fromBlock: 378204768,
  },
  optimism: {
    address: '0xd1883062629157Ff6Eae51ca355aCA4f52d2BD4E',
    fromBlock: 141019964,
  },
}

async function getMultiDepositorVaults(api) {
  const factory = factories[api.chain]
  const logs = await getLogs({
    api,
    target: factory.address,
    topics: [vaultCreatedTopic],
    eventAbi: vaultCreatedEvent,
    fromBlock: factory.fromBlock,
    onlyArgs: true,
  })

  return logs.map(log => log.vault)
}

async function getLegacyVaultValue(api, vault, feeCalculator) {
  const [totalSupply, decimals, vaultState] = await Promise.all([
    api.call({ abi: 'uint256:totalSupply', target: vault }),
    api.call({ abi: 'uint8:decimals', target: vault }),
    api.call({
      abi: 'function getVaultState(address vault) external view returns ((bool paused, uint8 maxPriceAge, uint16 minUpdateIntervalMinutes, uint16 maxPriceToleranceRatio, uint16 minPriceToleranceRatio, uint8 maxUpdateDelayDays, uint32 timestamp, uint24 accrualLag, uint128 unitPrice, uint128 highestPrice, uint128 lastTotalSupply))',
      target: feeCalculator,
      params: [vault],
    }),
  ])

  return (BigInt(totalSupply) * BigInt(vaultState[8]) / (10n ** BigInt(decimals))).toString()
}

async function getVaultValue(api, vault, feeCalculator) {
  // V2 calculators expose the vault value directly and use a different state
  // layout. Older calculators require the legacy totalSupply * unitPrice path.
  const value = await api.call({
    abi: 'function getVaultValueAtLastUpdate(address vault) view returns (uint256)',
    target: feeCalculator,
    params: [vault],
  }).catch(() => null)

  if (value !== null) return value
  return getLegacyVaultValue(api, vault, feeCalculator)
}

async function tvl(api) {
  const vaults = await getMultiDepositorVaults(api)

  await Promise.all(vaults.map(async vault => {
    const feeCalculator = await api.call({ abi: 'address:feeCalculator', target: vault })
    const [numeraireToken, value] = await Promise.all([
      api.call({ abi: 'address:NUMERAIRE', target: feeCalculator }),
      getVaultValue(api, vault, feeCalculator),
    ])

    // bgBTC and WBTC both use 8 decimals. The Morph bgBTC address is not
    // currently priced by the DefiLlama coins service, so use WBTC's BTC price.
    if (api.chain === 'morph' && numeraireToken.toLowerCase() === BGBTC) {
      api.addTokenVannila(WBTC, value)
    } else {
      api.add(numeraireToken, value)
    }
  }))
}

module.exports = {
  methodology: 'Counts the last reported net asset value of all Aera V3 multi-depositor vaults created by the protocol factories.',
  start: 1748414859,
  ethereum: { tvl },
  base: { tvl },
  morph: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
}
