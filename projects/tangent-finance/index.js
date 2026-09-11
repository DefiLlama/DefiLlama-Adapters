const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

// ----- Tangent core contracts on Ethereum mainnet -----
const MARKET_CREATOR = '0x214C8A1023B30032a2Eded109146658C6D6F2781'

// MarketCreator was deployed at block 24634921 — slight safety margin for logs.
const FROM_BLOCK = 24634900
const NULL_ADDRESS = ADDRESSES.null

// All five market-template events share the shape (address proxy, string name).
const MARKET_CREATED_EVENTS = [
  'event MarketCurveGaugeCreated(address proxy, string name)',
  'event MarketConvexCrvCreated(address proxy, string name)',
  'event MarketConvexFxnCreated(address proxy, string name)',
  'event MarketStakeDaoVaultV2Created(address proxy, string name)',
  'event BasicERC20MarketCreated(address proxy, string name)',
]

// ---------- Markets ----------

async function getAllMarkets(api) {
  const logsPerEvent = await Promise.all(
    MARKET_CREATED_EVENTS.map(eventAbi =>
      getLogs2({
        api,
        target: MARKET_CREATOR,
        eventAbi,
        fromBlock: FROM_BLOCK,
        // Each event shares the same target, so disambiguate the on-disk cache key.
        extraKey: eventAbi.match(/event (\w+)/)[1],
      })
    )
  )

  return logsPerEvent.flat().map(log => log.proxy)
}

async function tvl(api) {
  const markets = await getAllMarkets(api)
  if (markets.length === 0) return
  const collatTokens = await api.multiCall({ abi: 'address:collatToken', calls: markets })

  const [receiptTokens, stakingProxyVaults] = await Promise.all([
    api.multiCall({ abi: 'address:receiptToken', calls: markets, permitFailure: true }),
    api.multiCall({ abi: 'address:stakingProxyVault', calls: markets, permitFailure: true }),
  ])

  const directCalls = []
  const proxyVaults = []

  markets.forEach((market, i) => {
    const receiptToken = firstNonZeroAddress(receiptTokens[i])
    const stakingProxyVault = firstNonZeroAddress(stakingProxyVaults[i])

    if (receiptToken) {
      directCalls.push({ target: receiptToken, params: market, collatToken: collatTokens[i] })
    } else if (stakingProxyVault) {
      proxyVaults.push({ vault: stakingProxyVault, collatToken: collatTokens[i] })
    } else {
      directCalls.push({ target: collatTokens[i], params: market, collatToken: collatTokens[i] })
    }
  })

  const directBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: directCalls,
  })
  directBalances.forEach((balance, i) => api.add(directCalls[i].collatToken, balance))

  await addProxyVaultBalances(api, proxyVaults)
}

async function addProxyVaultBalances(api, proxyVaults) {
  if (proxyVaults.length === 0) return

  const vaults = proxyVaults.map(({ vault }) => vault)
  const [stakingTokens, rewardContracts] = await Promise.all([
    api.multiCall({ abi: 'address:stakingToken', calls: vaults }),
    api.multiCall({ abi: 'address:rewards', calls: vaults }),
  ])

  const [unstakedBalances, stakedBalances] = await Promise.all([
    api.multiCall({
      abi: 'erc20:balanceOf',
      calls: vaults.map((vault, i) => ({ target: stakingTokens[i], params: vault })),
    }),
    api.multiCall({
      abi: 'erc20:balanceOf',
      calls: vaults.map((vault, i) => ({ target: rewardContracts[i], params: vault })),
    }),
  ])

  proxyVaults.forEach(({ collatToken }, i) => {
    const balance = BigInt(unstakedBalances[i]?.toString() ?? 0) + BigInt(stakedBalances[i]?.toString() ?? 0)
    api.add(collatToken, balance)
  })
}

function firstNonZeroAddress(...addresses) {
  return addresses.find(address => address && address !== NULL_ADDRESS)
}

module.exports = {
  methodology:
    "TVL = collateral held across Tangent markets.",
  ethereum: {
    tvl,
  },
}