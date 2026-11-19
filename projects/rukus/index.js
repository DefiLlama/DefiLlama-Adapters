const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const INSTANT_FACTORY = '0x3019844dADA9A3764173cB6BaC6093ca6BF6D433'
const BACKED_FACTORY = '0x1B293936BCf87e77F2310303101F14E72EbA2b09'
const LAUNCH = 'event LaunchCreated(address indexed creator,address indexed token,address indexed market,uint16 creatorFeeBps,uint16 protocolFeeBps,uint256 creationFeePaid,uint256 foundingLaunchNumber,bool official,bytes32 metadataHash)'
const CAMPAIGN = 'event LiquidityProposalCreated(address indexed creator,address indexed escrow,bytes32 configHash,uint256 target,uint256 deadline,uint256 backerTokens,uint256 liquidityTokens,uint16 creatorFeeBps)'

async function tvl(api) {
  const launches = await getLogs2({ api, target: INSTANT_FACTORY, fromBlock: 89225477, eventAbi: LAUNCH, extraKey: 'rukus-instant-created' })
  const campaigns = await getLogs2({ api, target: BACKED_FACTORY, fromBlock: 89237576, eventAbi: CAMPAIGN, extraKey: 'rukus-backed-created' })
  const owners = [...launches.map(log => log.market), ...campaigns.map(log => log.escrow)]
  return sumTokens2({ api, owners, tokens: [nullAddress] })
}

module.exports = {
  methodology: 'Counts the ETH held by RUKUS Instant bonding curves and Backed campaign escrows, discovered from the two factories\' creation events. Launched tokens and liquidity moved to Uniswap V4 after graduation or settlement are not counted.',
  robinhood: { tvl },
}
