// https://docs.makina.finance/
// https://makina.finance/

const sdk = require('@defillama/sdk')
const { getLogs2 } = require('../helper/cache/getLogs')

// Each hub chain has a HubCoreFactory that deploys its machines (and their hub calibers) and pre-deposit vaults.
// fromBlock is the first machine/pre-deposit deployment on that factory.
// Spoke calibers deployed on a chain for the other hub's machines are resolved from ethereum data only, so ethereum
// tvl never depends on base logs:
// - on ethereum, from CaliberCreated on the spoke factory (same address as the base hub factory)
// - on base, via each ethereum machine's getSpokeCaliberMailbox(8453) -> mailbox.caliber()
const hubs = {
  ethereum: {
    chainId: 1, factory: '0x8d28A69328561eF9F171c58996fEcB9F494e070c', fromBlock: 23426666,
    spokeFactory: { address: '0x1E1fa6F5f258b744881634216bDBc612B09C3C30', fromBlock: 25834668 },
  },
  base: {
    chainId: 8453, factory: '0x1E1fa6F5f258b744881634216bDBc612B09C3C30', fromBlock: 50872000,
    spokeOf: 'ethereum',
  },
}

const abi = {
  MachineCreated: 'event MachineCreated(address indexed machine, address indexed shareToken)',
  PreDepositVaultCreated: 'event PreDepositVaultCreated(address indexed preDepositVault, address indexed shareToken)',
  CaliberCreated: 'event CaliberCreated(address indexed caliber, address indexed machineEndpoint)',
  accountingToken: 'address:accountingToken',
  lastTotalAum: 'uint256:lastTotalAum',
  hubCaliber: 'address:hubCaliber',
  getSpokeCaliberMailbox: 'function getSpokeCaliberMailbox(uint256 chainId) view returns (address)',
  caliber: 'address:caliber',
  convertToAssets: 'function convertToAssets(uint256 shares) view returns (uint256)',
  depositToken: 'address:depositToken',
}

// public base rpcs can lag a few blocks behind the resolved block
const getToBlock = async (api) => api.chain === 'base' ? (await api.getBlock()) - 10 : undefined

async function getMachines(api) {
  const { factory, fromBlock } = hubs[api.chain]
  const logs = await getLogs2({ api, target: factory, fromBlock, eventAbi: abi.MachineCreated, extraKey: 'machines' })
  return { machines: logs.map(log => log.machine), shareTokens: logs.map(log => log.shareToken) }
}

// calibers deployed on this chain by machines hosted on the other hub chain
async function getSpokeCalibers(api) {
  const { spokeFactory, spokeOf } = hubs[api.chain]
  if (spokeFactory) {
    const logs = await getLogs2({ api, target: spokeFactory.address, fromBlock: spokeFactory.fromBlock, eventAbi: abi.CaliberCreated, extraKey: 'spokeCalibers' })
    return logs.map(log => log.caliber)
  }
  const hubApi = new sdk.ChainApi({ chain: spokeOf, timestamp: api.timestamp })
  await hubApi.getBlock()
  const { machines } = await getMachines(hubApi)
  // reverts for machines without a spoke caliber on this chain
  const mailboxes = await hubApi.multiCall({ abi: abi.getSpokeCaliberMailbox, calls: machines.map(target => ({ target, params: [hubs[api.chain].chainId] })), permitFailure: true })
  return api.multiCall({ abi: abi.caliber, calls: mailboxes.filter(Boolean) })
}

async function tvl(api) {
  const { factory, fromBlock } = hubs[api.chain]
  const { machines, shareTokens } = await getMachines(api)

  // a machine's AUM covers its hub caliber and all of its spoke calibers, denominated in its accounting token
  const [accountingTokens, aums, hubCalibers] = await Promise.all([
    api.multiCall({ abi: abi.accountingToken, calls: machines }),
    api.multiCall({ abi: abi.lastTotalAum, calls: machines }),
    api.multiCall({ abi: abi.hubCaliber, calls: machines }),
  ])
  api.add(accountingTokens, aums)

  // machines can allocate into other machines: net out Makina share tokens held by any Makina caliber or machine on this chain
  const holders = [...hubCalibers, ...await getSpokeCalibers(api), ...machines]
  const pairs = machines.flatMap((machine, i) => holders.map(holder => ({ machine, shareToken: shareTokens[i], accountingToken: accountingTokens[i], holder })))
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: pairs.map(({ shareToken, holder }) => ({ target: shareToken, params: [holder] })) })
  const nested = pairs.map((pair, i) => ({ ...pair, shares: balances[i] })).filter(({ shares }) => BigInt(shares) > 0n)
  const nestedAssets = await api.multiCall({ abi: abi.convertToAssets, calls: nested.map(({ machine, shares }) => ({ target: machine, params: [shares] })) })
  nested.forEach(({ accountingToken }, i) => api.add(accountingToken, -BigInt(nestedAssets[i])))

  // deposits still sitting in pre-deposit vaults that have not migrated to their machine yet
  const preDepositLogs = await getLogs2({ api, target: factory, fromBlock, eventAbi: abi.PreDepositVaultCreated, extraKey: 'preDepositVaults' })
  const preDepositVaults = preDepositLogs.map(log => log.preDepositVault)
  const depositTokens = await api.multiCall({ abi: abi.depositToken, calls: preDepositVaults })
  return api.sumTokens({ tokensAndOwners2: [depositTokens, preDepositVaults] })
}

module.exports = {
  methodology: 'Machines and pre-deposit vaults are discovered from Makina factory events. TVL is the sum of each machine\'s on-chain lastTotalAum() (hub and spoke calibers combined), valued in its accounting token, plus deposit tokens still held by pre-deposit vaults. Makina share tokens held by other Makina machines or calibers are subtracted to avoid double counting nested strategies.',
  start: '2025-09-24',
}

Object.keys(hubs).forEach(chain => {
  module.exports[chain] = { tvl }
})
