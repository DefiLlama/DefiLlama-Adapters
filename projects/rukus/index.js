const { getLogs2 } = require('../helper/cache/getLogs')

const INSTANT_FACTORY = '0x3019844dADA9A3764173cB6BaC6093ca6BF6D433'
const BACKED_FACTORY = '0x1B293936BCf87e77F2310303101F14E72EbA2b09'
const ETH = '0x0000000000000000000000000000000000000000'
const LAUNCH = 'event LaunchCreated(address indexed creator,address indexed token,address indexed market,uint16 creatorFeeBps,uint16 protocolFeeBps,uint256 creationFeePaid,uint256 foundingLaunchNumber,bool official,bytes32 metadataHash)'
const CAMPAIGN = 'event LiquidityProposalCreated(address indexed creator,address indexed escrow,bytes32 configHash,uint256 target,uint256 deadline,uint256 backerTokens,uint256 liquidityTokens,uint16 creatorFeeBps)'

function owners(logs, field) {
  const addresses = [...new Set(logs.map(log => String(log[field]).toLowerCase()))]
  if (addresses.some(address => !/^0x[0-9a-f]{40}$/.test(address) || address === ETH))
    throw new Error('Invalid RUKUS market discovery')
  return addresses
}

async function tvl(api) {
  const [launches, campaigns] = await Promise.all([
    getLogs2({ api, target: INSTANT_FACTORY, fromBlock: 89225477, eventAbi: LAUNCH, extraKey: 'rukus-instant-created' }),
    getLogs2({ api, target: BACKED_FACTORY, fromBlock: 89237576, eventAbi: CAMPAIGN, extraKey: 'rukus-backed-created' }),
  ])
  const curves = owners(launches, 'market'), escrows = owners(campaigns, 'escrow')
  let total = 0n
  if (curves.length) {
    const reserves = await api.multiCall({ abi: 'uint256:realReserve', calls: curves })
    if (reserves.length !== curves.length) throw new Error('Incomplete curve reserve reads')
    for (const value of reserves) {
      if (!/^\d+$/.test(String(value))) throw new Error('Invalid curve reserve')
      total += BigInt(value)
    }
  }
  if (escrows.length) {
    const [states, contributed, refunded] = await Promise.all([
      api.multiCall({ abi: 'uint8:state', calls: escrows }),
      api.multiCall({ abi: 'uint256:totalContributed', calls: escrows }),
      api.multiCall({ abi: 'uint256:totalRefunded', calls: escrows }),
    ])
    if ([states, contributed, refunded].some(values => values.length !== escrows.length))
      throw new Error('Incomplete campaign reads')
    for (let i = 0; i < escrows.length; i++) {
      if (![states[i], contributed[i], refunded[i]].every(value => /^\d+$/.test(String(value))))
        throw new Error('Invalid campaign accounting')
      const state = BigInt(states[i]), raised = BigInt(contributed[i]), returned = BigInt(refunded[i])
      if (state > 7n || returned > raised) throw new Error('Inconsistent campaign accounting')
      // CLAIMABLE = 5: liquidity has left escrow; retained success fees are revenue, not TVL.
      if (state !== 5n) total += raised - returned
    }
  }
  api.add(ETH, total.toString())
}

module.exports = {
  methodology: 'Counts real ETH reserves reported by RUKUS Instant bonding curves plus contributed ETH less completed refunds in unsettled Backed campaigns. Markets are discovered from canonical factory creation events and balances are read on-chain at the requested block. Excludes virtual ETH, token valuations, fee liabilities, excess-payment credits, donations, treasury wallets and settled campaign token claims. Graduated/settled Uniswap V4 liquidity is excluded to avoid counting the same pool liquidity under RUKUS and Uniswap.',
  robinhood: { tvl },
}
