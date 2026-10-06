// https://docs.makina.finance/
// https://makina.finance/

const { getLogs2 } = require('../helper/cache/getLogs')

// Makina core factories are deployed at the same address on every chain. On a given chain, the hub factory
// deploys that chain's machines (and their hub calibers), while the other factory deploys spoke calibers for
// machines hosted on the other hub chain.
const HUB_FACTORY_ETHEREUM = '0x8d28A69328561eF9F171c58996fEcB9F494e070c'
const HUB_FACTORY_BASE = '0x1E1fa6F5f258b744881634216bDBc612B09C3C30'

const config = {
  ethereum: {
    hubFactory: { address: HUB_FACTORY_ETHEREUM, fromBlock: 23426666 },
    factories: [
      { address: HUB_FACTORY_ETHEREUM, fromBlock: 23426666 },
      { address: HUB_FACTORY_BASE, fromBlock: 25834668 },
    ],
  },
  base: {
    hubFactory: { address: HUB_FACTORY_BASE, fromBlock: 50439206 },
    factories: [
      { address: HUB_FACTORY_BASE, fromBlock: 50439206 },
      { address: HUB_FACTORY_ETHEREUM, fromBlock: 35929980 },
    ],
  },
}

const abi = {
  MachineCreated: 'event MachineCreated(address indexed machine, address indexed shareToken)',
  PreDepositVaultCreated: 'event PreDepositVaultCreated(address indexed preDepositVault, address indexed shareToken)',
  CaliberCreated: 'event CaliberCreated(address indexed caliber, address indexed machineEndpoint)',
  accountingToken: 'address:accountingToken',
  lastTotalAum: 'uint256:lastTotalAum',
  convertToAssets: 'function convertToAssets(uint256 shares) view returns (uint256)',
  depositToken: 'address:depositToken',
}

async function tvl(api) {
  const { hubFactory, factories } = config[api.chain]

  const [machineLogs, preDepositLogs, caliberLogs] = await Promise.all([
    getLogs2({ api, target: hubFactory.address, fromBlock: hubFactory.fromBlock, eventAbi: abi.MachineCreated, extraKey: 'machines' }),
    getLogs2({ api, target: hubFactory.address, fromBlock: hubFactory.fromBlock, eventAbi: abi.PreDepositVaultCreated, extraKey: 'preDepositVaults' }),
    Promise.all(factories.map(({ address, fromBlock }) => getLogs2({ api, target: address, fromBlock, eventAbi: abi.CaliberCreated, extraKey: 'calibers' }))),
  ])

  const machines = machineLogs.map(log => log.machine)
  const shareTokens = machineLogs.map(log => log.shareToken)
  // every hub and spoke caliber on this chain, whichever hub chain its machine lives on
  const calibers = caliberLogs.flat().map(log => log.caliber)

  // a machine's AUM covers its hub caliber and all of its spoke calibers, denominated in its accounting token
  const [accountingTokens, aums] = await Promise.all([
    api.multiCall({ abi: abi.accountingToken, calls: machines }),
    api.multiCall({ abi: abi.lastTotalAum, calls: machines }),
  ])
  api.add(accountingTokens, aums)

  // machines can allocate into other machines: net out Makina share tokens held by Makina calibers and machines
  const holders = [...calibers, ...machines]
  const nestedShares = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: shareTokens.flatMap(token => holders.map(holder => ({ target: token, params: [holder] }))),
  })
  const nestedCalls = []
  shareTokens.forEach((_, i) => {
    const shares = nestedShares.slice(i * holders.length, (i + 1) * holders.length).reduce((sum, bal) => sum + BigInt(bal), 0n)
    if (shares > 0n) nestedCalls.push({ machineIndex: i, call: { target: machines[i], params: [shares.toString()] } })
  })
  const nestedAssets = await api.multiCall({ abi: abi.convertToAssets, calls: nestedCalls.map(({ call }) => call) })
  nestedCalls.forEach(({ machineIndex }, i) => api.add(accountingTokens[machineIndex], -BigInt(nestedAssets[i])))

  // deposits still sitting in pre-deposit vaults that have not migrated to their machine yet
  const preDepositVaults = preDepositLogs.map(log => log.preDepositVault)
  const depositTokens = await api.multiCall({ abi: abi.depositToken, calls: preDepositVaults })
  return api.sumTokens({ tokensAndOwners2: [depositTokens, preDepositVaults] })
}

module.exports = {
  methodology: 'Machines and pre-deposit vaults are discovered from Makina factory events. TVL is the sum of each machine\'s on-chain lastTotalAum() (hub and spoke calibers combined), valued in its accounting token, plus deposit tokens still held by pre-deposit vaults. Makina share tokens held by other Makina machines or calibers are subtracted to avoid double counting nested strategies.',
  start: '2025-09-24',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
