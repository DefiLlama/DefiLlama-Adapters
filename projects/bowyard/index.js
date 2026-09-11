const ADDRESSES = require('../helper/coreAssets.json')

const LAUNCHPAD = '0x0F724aED8961C0446Cf73E9C45be562BEB22e774'
const LAUNCH_AGENT = '0x821de9ff15B0d1f31795822e5E4107FF060e9E37'
const AGENT_LAUNCHPAD = '0xc5e8ee1D72f08a29CCEB465BeFf0B4b830D63750'
const DEX_FACTORY = '0x27275079932d9a5cBA34Cb40Bf86084bDdD89241'

async function tvl(api) {
  const dexPairs = await api.fetchList({
    target: DEX_FACTORY,
    lengthAbi: 'uint256:pairCount',
    itemAbi: 'function pairAt(uint256) view returns (address)',
  })

  return api.sumTokens({
    owners: [LAUNCHPAD, LAUNCH_AGENT, AGENT_LAUNCHPAD, ...dexPairs],
    tokens: [ADDRESSES.robinhood.USDG],
  })
}

module.exports = {
  methodology:
    'Counts canonical USDG held in BowYard bonding curves, user-funded Launch Agent budgets, Agent Launchpad V2 curves, and the USDG side of permanently locked BowYard DEX pools on Robinhood Chain. BowYard-launched tokens, fee and revenue vaults, and protocol treasury balances are excluded.',
  start: '2026-07-26',
  robinhood: { tvl },
}
