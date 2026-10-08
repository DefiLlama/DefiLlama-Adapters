const { getLogs2 } = require('../helper/cache/getLogs')

const V6_FACTORY = '0x33c829fa4112295d998ea7fc4b7caaf02b3697c4'
const V6_START_BLOCK = 63338426
const V8_FACTORY = '0x3B1c25C20722f47faFe04f4A510b8BdB402236EC'
const V8_START_BLOCK = 65499390

const V6_CREATED = 'event ProjectCreated(uint256 indexed id,address indexed creator,address indexed market,address quote,address adapter,address hook,string metadataURI,bytes32 metadataHash)'
const V8_CREATED = 'event ProjectCreated(uint256 indexed id,address indexed creator,address indexed market,address quote,address lifecycle,address router,address rewards,string metadataURI,bytes32 metadataHash,uint16 feeBps,uint16 creatorShareBps)'

async function addV6Tvl(api) {
  const projects = await getLogs2({
    api,
    target: V6_FACTORY,
    fromBlock: V6_START_BLOCK,
    eventAbi: V6_CREATED,
  })
  if (!projects.length) return

  const calls = projects.map(({ market }) => ({ target: market }))
  const [phases, raised, reserves] = await Promise.all([
    api.multiCall({ abi: 'uint8:phase', calls }),
    api.multiCall({ abi: 'uint256:raised', calls }),
    api.multiCall({ abi: 'uint256:reserve', calls }),
  ])

  projects.forEach(({ quote }, i) => {
    const phase = Number(phases[i])
    if (phase === 0) api.add(quote, raised[i])
    if (phase === 1 || phase === 2) api.add(quote, reserves[i])
  })
}

async function addV8Tvl(api) {
  const projects = await getLogs2({
    api,
    target: V8_FACTORY,
    fromBlock: V8_START_BLOCK,
    eventAbi: V8_CREATED,
  })
  if (!projects.length) return

  const marketCalls = projects.map(({ market }) => ({ target: market }))
  const lifecycleCalls = projects.map(({ lifecycle }) => ({ target: lifecycle }))
  const [started, raised, graduated, principal, floors] = await Promise.all([
    api.multiCall({ abi: 'bool:started', calls: marketCalls }),
    api.multiCall({ abi: 'uint256:raised', calls: marketCalls }),
    api.multiCall({ abi: 'bool:graduated', calls: lifecycleCalls }),
    api.multiCall({ abi: 'uint256:principalQuote', calls: lifecycleCalls }),
    api.multiCall({ abi: 'address:floor', calls: lifecycleCalls }),
  ])
  const floorCash = await api.multiCall({
    abi: 'uint256:cash',
    calls: floors.map(target => ({ target })),
  })

  projects.forEach(({ quote }, i) => {
    if (graduated[i]) return
    const amount = started[i]
      ? BigInt(principal[i]) + BigInt(floorCash[i])
      : BigInt(raised[i])
    api.add(quote, amount)
  })
}

async function tvl(api) {
  await addV6Tvl(api)
  await addV8Tvl(api)
}

module.exports = {
  methodology: 'Counts the quote assets backing active JOIN launches on Robinhood Chain. V6 markets contribute their on-chain fair-launch raised amount or trading reserve. V8 markets contribute fair-launch deposits before opening, then the quote principal in JOIN-owned Uniswap V4 positions plus isolated floor cash while the market remains active. Launched tokens, fees, treasury balances, and graduated V8 positions are excluded. Active Uniswap V4 position principal is also visible in Uniswap V4 TVL, so this adapter is marked double-counted.',
  start: '2026-09-15',
  doublecounted: true,
  robinhood: { tvl },
}
