const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

// Each source resolves to (token, portal) pairs. Keep old sources while their portals hold funds.
const PORTAL_SOURCES = [
  // Aztec Alpha v5
  fixed({ token: ADDRESSES.ethereum.DAI, portal: '0xdf410ad448A0f7165181FBdB32f8896f4a0d9449' }),
  fixed({ token: ADDRESSES.ethereum.sUSDS, portal: '0xd7ae00b91ba0b8e0240b22cd75fe447d177c260f' }),

  // Aztec Tierra (Alpha v6)
  portalFactory({ factory: '0xceae64c7211a2208affc4f396add1d46996cd2a2', fromBlock: 26276689 }),
]

function fixed({ token, portal }) {
  return async () => [[token, portal]]
}

function portalFactory({ factory, fromBlock }) {
  return async (api) => {
    const logs = await getLogs2({
      api,
      factory,
      fromBlock,
      eventAbi: 'event PortalDeployed(address indexed portal, address indexed underlying, bytes32 l2Token, (uint128 txAmountCap, uint256 rate, uint256 globalLimit) caps)',
    })
    return logs.map(({ underlying, portal }) => [underlying, portal])
  }
}

async function tvl(api) {
  const portals = await Promise.all(PORTAL_SOURCES.map((source) => source(api)))
  return api.sumTokens({ tokensAndOwners: portals.flat() })
}

module.exports = {
  start: '2026-09-25',
  methodology:
    "TVL is the tokens held by zk.money's Ethereum portals, which back private balances on Aztec.",
  ethereum: { tvl },
}
