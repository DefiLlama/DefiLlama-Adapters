const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  unit0: { factory: '0x6b88edbf234b51da7acea033a4572973f67ea957', fromBlock: 10512200 },
}

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain]
  if (await api.getBlock() < fromBlock) return
  const campaigns = await getLogs2({
    api, target: factory, fromBlock,
    eventAbi: 'event CampaignCreated(address indexed campaign, address indexed creator, address indexed token, bytes32 campaignUuid, address projectReferrer, uint256 grossDeposit, uint256 protocolFee, uint256 netDeposit, uint16 protocolBps)',
  })
  return api.sumTokens({ tokensAndOwners: campaigns.map(({ token, campaign }) => [token, campaign]) })
}

module.exports = {
  methodology: 'Counts remaining reward-token balances in campaign escrow contracts created by the canonical Xyper Market CampaignFactory. Campaigns are discovered from on-chain CampaignCreated events. Paid rewards, protocol fee recipients, referral and partner distribution vaults, points, and testnets are excluded. Native deposits are wrapped by the factory and counted only as the campaign ERC-20 balance.',
  ...Object.fromEntries(Object.keys(config).map(chain => [chain, { tvl }])),
}
