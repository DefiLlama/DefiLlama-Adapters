const { getLogs } = require('../helper/cache/getLogs')

// Dirac has two on-chain vault families; both expose an ERC-4626-style
// totalAssets() denominated in the vault's asset(), so TVL = sum of totalAssets
// across every vault, discovered dynamically on each refresh (no hardcoded list,
// new vaults are picked up automatically).
//
//  1. Vaults created permissionlessly through the vault deployers
//     -> discovered from DeployVault logs.
//  2. DiracVault instances from the DiracVaultFactory (current + legacy
//     generations) -> enumerated on-chain via getDeployedVaults().
//
// Note: Dirac also runs on Robinhood Chain (4663), not yet supported by DefiLlama,
// so it is omitted until that chain is onboarded.

const DEPLOY_VAULT_EVENT =
  'event DeployVault(address indexed caller, address indexed vault, address[] adapters)'

// Vault deployers, per chain.
const EARN_DEPLOYERS = {
  base: [
    { target: '0x317848EBa554a92d34a763C4175C38170753ea8A', fromBlock: 50215751 }, // current
    { target: '0x7d45718c79186Da8889111b5D8d7eDe6d128fb14', fromBlock: 50092600 }, // legacy
  ],
}

// Delta-neutral DiracVault factories (current + legacy), per chain.
// Each exposes getDeployedVaults() -> address[].
const DN_FACTORIES = {
  base: [
    '0x1E367334f17ac318d8d8f5a696DE281AfC943FaC',
    '0x78e7B00B589c0b4281abdA0ec2cdaD5eb5A55F38',
  ],
  arbitrum: [
    '0xaf234cde60320e721d186ae5ecbbeb5d251eeb2e',
    '0x12b3f4094716b38697729e64527e21884f035e65',
    '0x1aeea6e35733b37f43f65c3156d88b36378518f1',
  ],
  polygon: [
    '0x78e7b00b589c0b4281abda0ec2cdad5eb5a55f38',
  ],
}

async function tvl(api) {
  const chain = api.chain
  const vaults = new Set()

  // 1. Vaults created through the deployers (DeployVault events). No error handling:
  // if discovery fails, the error propagates and fails the whole refresh, so DefiLlama
  // retries rather than publishing a partial vault set that under-reports TVL.
  for (const { target, fromBlock } of EARN_DEPLOYERS[chain] || []) {
    const logs = await getLogs({ api, target, fromBlock, eventAbi: DEPLOY_VAULT_EVENT, onlyArgs: true })
    for (const log of logs) vaults.add(log.vault)
  }

  // 2. Delta-neutral vaults (factory enumerator). No permitFailure: a factory whose
  // getDeployedVaults() query reverts fails the refresh rather than silently dropping
  // that factory's vaults from the total.
  const factories = DN_FACTORIES[chain] || []
  if (factories.length) {
    const lists = await api.multiCall({ abi: 'address[]:getDeployedVaults', calls: factories })
    for (const list of lists) for (const v of list) vaults.add(v)
  }

  const list = [...vaults]
  if (!list.length) return

  // Every vault is ERC-4626: totalAssets() in its own asset() (USDC). Read both so
  // DefiLlama prices the real underlying token. No permitFailure: a failed read fails
  // the refresh rather than under-reporting by skipping the vault.
  const [assets, tokens] = await Promise.all([
    api.multiCall({ abi: 'uint256:totalAssets', calls: list }),
    api.multiCall({ abi: 'address:asset', calls: list }),
  ])
  list.forEach((_, i) => api.add(tokens[i], assets[i]))
}

module.exports = {
  methodology:
    'Sums totalAssets() across every Dirac vault on each chain, discovered dynamically per refresh: vaults created through the deployers\' DeployVault events, and delta-neutral DiracVault instances enumerated on-chain via each factory\'s getDeployedVaults() (current + legacy generations). Denominated in each vault\'s underlying asset (USDC). Robinhood Chain (4663) is omitted until DefiLlama supports it.',
  base: { tvl },
  arbitrum: { tvl },
  polygon: { tvl },
}
