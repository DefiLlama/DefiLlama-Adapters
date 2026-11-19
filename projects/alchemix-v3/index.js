const { getLogs2 } = require("../helper/cache/getLogs");

const FACTORY = {
  ethereum: { factory: '0xdd56b00302e91C4c2b8246156bDEAa1cEDc58984', fromBlock: 24875892 },
  arbitrum: { factory: '0x8c7C0C380bA4eE38461eb5a6b82e5d930EC11Ca2', fromBlock: 452291175 },
  optimism: { factory: '0x8c7C0C380bA4eE38461eb5a6b82e5d930EC11Ca2', fromBlock: 150271732 },
  base: { factory: '0x2584E8b0616b3E750492c9629a3b27679C410cb9', fromBlock: 51125654 },
}

const CREATE_VAULT_EVENT =
  'event CreateVaultV2(address indexed owner, address indexed asset, bytes32 salt, address indexed newVaultV2)'

async function tvl(api) {
  const { factory, fromBlock } = FACTORY[api.chain]
  const logs = await getLogs2({api, factory, fromBlock, eventAbi: CREATE_VAULT_EVENT, onlyArgs: true })
  return api.erc4626Sum2({ calls: logs.map(l => l.newVaultV2) })
}

module.exports = {
  doublecounted: true,
  methodology:
    'Value of all assets deposited in Alchemix V3 vaults',
  ethereum: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
  base: { tvl },
}
