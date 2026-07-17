const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const pLimit = require('p-limit')
const { buildIncomingDebtByVault, subtractIncomingDebt } = require('./helpers')

const kongEndpoint = 'https://kong.yearn.fi/api/rest'
const snapshotLimit = pLimit(10)

const v1Vaults = [
  '0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e',
  '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c',
  '0x37d19d1c4E1fa9DC47bD1eA12f742a0887eDa74a',
  '0xACd43E627e64355f1861cEC6d3a6688B31a6F952',
  '0x2f08119C6f07c006695E079AAFc638b8789FAf18',
  '0xBA2E7Fed597fd0E3e70f5130BcDbbFE06bB94fe1',
  '0x2994529C0652D127b7842094103715ec5299bBed',
  '0x7Ff566E1d69DEfF32a7b244aE7276b9f90e9D0f6',
  '0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7',
  '0x9cA85572E6A3EbF24dEDd195623F188735A5179f',
  '0xec0d8D3ED5477106c6D4ea27D90a60e594693C90',
  '0x629c759D1E83eFbF63d84eb3868B564d9521C129',
  '0x0FCDAeDFb8A7DfDa2e9838564c5A1665d856AFDF',
  '0xcC7E70A958917cCe67B4B87a8C30E6297451aE98',
  '0x98B058b2CBacF5E99bC7012DF757ea7CFEbd35BC',
  '0xE0db48B4F71752C4bEf16De1DBD042B82976b8C7',
  '0x5334e150B938dd2b6bd040D9c4a03Cff0cED3765',
  '0xFe39Ce91437C76178665D64d7a2694B0f6f17fE3',
  '0xF6C9E9AF314982A4b38366f4AbfAa00595C5A6fC',
  '0xA8B1Cb4ed612ee179BDeA16CCa6Ba596321AE52D',
  '0x46AFc2dfBd1ea0c0760CAD8262A5838e803A37e5',
  '0x5533ed0a3b83F70c3c4a1f69Ef5546D3D4713E44',
  '0x8e6741b456a074F0Bc45B8b82A755d4aF7E965dF',
  '0x03403154afc09Ce8e44C3B185C82C6aD5f86b9ab',
  '0xE625F5923303f1CE7A43ACFEFd11fd12f30DbcA4',
  '0xBacB69571323575C6a5A3b4F9EEde1DC7D31FBc1',
  '0x1B5eb1173D2Bf770e50F10410C9a96F7a8eB6e75',
  '0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6',
]
const blacklist = [
  '0xbD17B1ce622d73bD438b9E658acA5996dc394b0d',
  '0xc5bDdf9843308380375a611c18B50Fb9341f502A',
  '0x07FB4756f67bD46B748b16119E802F1f880fb2CC',
  '0x7F83935EcFe4729c4Ea592Ab2bC1A32588409797',
  '0x123964EbE096A920dae00Fb795FFBfA0c9Ff4675',
  '0x39546945695DCb1c037C836925B355262f551f55',
  '0x58900d761Ae3765B75DDFc235c1536B527F25d8F',
  // Katana pre-deposit vaults, which are part of the Katana bridge infrastructure.
  '0x7B5A0182E400b241b317e781a4e9dEdFc1429822',
  '0xF470EB50B4a60c9b069F7Fd6032532B8F5cC014d',
  '0x48c03B6FfD0008460F8657Db1037C7e09dEedfcb',
  '0xA5DaB32DbE68E6fa784e1e50e4f620a0477D3896',
  '0x92C82f5F771F6A44CfA09357DD0575B81BF5F728',
  '0xe1Ac97e2616Ad80f69f705ff007A4bbb3655544a',
  '0xcc6a16Be713f6a714f68b0E1f4914fD3db15fBeF',
  '0x77570CfEcf83bc6bB08E2cD9e8537aeA9F97eA2F',
  ...v1Vaults,
].map(i => i.toLowerCase())

async function tvl(api) {
  // Kong is Yearn's maintained indexer, replacing yDaemon. Its REST list is
  // chain-specific; balances and empty-vault filtering still come from on-chain
  // totalAssets calls below.
  const data = await getConfig(
    `yearn/vaults-${api.chainId}`,
    `${kongEndpoint}/list/vaults/${api.chainId}?origin=yearn`,
  )

  if (!Array.isArray(data))
    throw new Error('Invalid Kong response: expected vaults array')

  const candidates = data
    .filter(vault => vault.chainId === api.chainId)
    .filter(vault => !blacklist.includes(vault.address.toLowerCase()))
  const candidateCalls = candidates.map(vault => vault.address)
  const candidateBals = await api.multiCall({
    abi: 'uint256:totalAssets',
    calls: candidateCalls,
    permitFailure: true,
  })

  // Kong's priced TVL can be zero when an underlying asset has no price. Read
  // every candidate on-chain and discard only vaults with no assets.
  const activeVaults = candidates
    .map((vault, i) => ({ vault, balance: candidateBals[i] }))
    .filter(({ balance }) => BigInt(balance ?? 0) > 0n)
  // The REST list omits strategy debts, so load snapshots only for active
  // vaults that have strategies. These relationships prevent capital allocated
  // to another Yearn vault from being counted in both the parent and child.
  const vaults = await Promise.all(activeVaults.map(async ({ vault }) => {
    if (!vault.strategiesCount) return { ...vault, debts: [] }

    const snapshot = await snapshotLimit(() => get(
      `${kongEndpoint}/snapshot/${api.chainId}/${vault.address}`,
    ))
    if (!Array.isArray(snapshot?.debts))
      throw new Error(`Invalid Kong snapshot for ${vault.address}: expected debts array`)

    return { ...vault, debts: snapshot.debts }
  }))
  const bals = activeVaults.map(({ balance }) => balance)
  const calls = vaults.map(vault => vault.address)

  // Each deduction is denominated in the destination vault's asset, so it can
  // be subtracted directly from that vault's totalAssets result.
  const incomingDebtByVault = buildIncomingDebtByVault(vaults)

  // V2 vaults expose token(), while ERC-4626/V3 vaults expose asset(). Trying
  // both lets the same loop cover both generations.
  const tokens = await api.multiCall({ abi: 'address:token', calls, permitFailure: true })

  const tokensAlt = await api.multiCall({ abi: 'address:asset', calls, permitFailure: true })
  bals.forEach((bal, i) => {
    const token = tokens[i] || tokensAlt[i]
    const incomingDebt = incomingDebtByVault.get(vaults[i].address.toLowerCase())

    // Keep any capital supplied directly to the child vault, but remove the
    // portion already included in one or more parent vaults.
    const adjustedBalance = subtractIncomingDebt(bal, incomingDebt)
    if (token && adjustedBalance > 0n) api.add(token, adjustedBalance)
  })

  // V1 predates totalAssets/ERC-4626. It is excluded from the Kong loop through
  // the blacklist and valued separately as totalSupply * pricePerShare.
  if (api.chain === 'ethereum') {
    const tokens = await api.multiCall({ abi: 'address:token', calls: v1Vaults })
    let bals = await api.multiCall({ abi: 'erc20:totalSupply', calls: v1Vaults })
    const ratio = await api.multiCall({ abi: 'uint256:getPricePerFullShare', calls: v1Vaults })
    bals = bals.map((bal, i) => bal * ratio[i] / 1e18)
    api.addTokens(tokens, bals)
  }

  // Resolve LP-like vault assets after all adjusted balances have been added.
  return sumTokens2({ api, resolveLP: api.chain !== 'ethereum' })
}


module.exports = {
  doublecounted: true,
  timetravel: false,
  hallmarks: [
    ['2020-07-17', "YFI token Launch"],
  ]
}

const chains = ['ethereum', 'fantom', 'arbitrum', 'optimism', 'polygon', 'base', 'katana']

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
