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
  const pairs = new Map(campaigns.map(({ token, campaign }) => [campaign.toLowerCase(), [token, campaign]]))
  if (!pairs.size) return
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: [...pairs.values()].map(([target, owner]) => ({ target, params: [owner] })),
  })
  ;[...pairs.values()].forEach(([token], i) => {
    // Verified WUNIT0 is a standard 18-decimal, 1:1 native UNIT0 wrapper.
    // Its contract address is not yet priced by the coins API.
    if (api.chain === 'unit0' && token.toLowerCase() === '0xcf43f7703d9b4e8835f977ef364b4014fa7e856e')
      api.addCGToken('unit0', Number(balances[i]) / 1e18)
    else api.add(token, balances[i])
  })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Counts remaining reward-token balances in campaign escrow contracts created by the canonical Xyper Market CampaignFactory. Campaigns are discovered from on-chain CampaignCreated events. Paid rewards, protocol fee recipients, referral and partner distribution vaults, points, and testnets are excluded. WUNIT0 is valued 1:1 as native UNIT0 using its CoinGecko price. Native deposits are wrapped by the factory and counted only as the campaign ERC-20 balance.',
  ...Object.fromEntries(Object.keys(config).map(chain => [chain, { tvl }])),
}
