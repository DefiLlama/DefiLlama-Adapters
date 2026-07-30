const sdk = require('@defillama/sdk')
const { staking } = require('../helper/staking')
const { sumUnknownTokens } = require('../helper/unknownTokens')
const { nullAddress } = require('../helper/tokenMapping')
const { getLogs2 } = require('../helper/cache/getLogs')

// BWLK staking (GMX-style reward trackers), Ethereum only.
// Staked BWLK is held by the staked-BWLK tracker (sBWLK).
const BWLK = '0xF9a352b7C7B62a852e5C8A64A455246Dd9596461'
const STAKED_BWLK_TRACKER = '0x3961F92c26724C9d61CED679540F35794d90c576'

// Boardwalk v2 LaunchFactory per chain, with its deploy block
const config = {
  ethereum: { factory: '0xfAEdbA0E97D5DCD7A29fB6778D7e17b1be35c0b8', deployBlock: 25560628 },
  base: { factory: '0x4F7af6f968C30be6FC196Cd5eed68032022AB067', deployBlock: 48800691 },
  arbitrum: { factory: '0xe64A71A60D552B56579D8edeB13E86bD6222F882', deployBlock: 485200176 },
  robinhood: { factory: '0x177dbEDd02cEe010b80a0A3F284c9FD9F67D8a9e', deployBlock: 13115699 },
}

const launchInfoAbi = 'function launches(address) view returns (address token, address feeDistributor, address presaleManager, address vestingStream, address lpStaking, address issuer, uint8 path, uint32 createdAt)'

const liquiditySeededAbi = 'event LiquiditySeeded(uint256 raiseAmount, uint256 tokenAmount, uint256 lpTokens)'

async function tvl(api) {
  const { factory, deployBlock } = config[api.chain]
  const tokens = await api.fetchList({ lengthAbi: 'uint256:launchCount', itemAbi: 'function allLaunches(uint256) view returns (address)', target: factory })
  if (!tokens.length) return api.getBalances()
  const launches = await api.multiCall({ abi: launchInfoAbi, calls: tokens, target: factory })
  // WETH contributed to presales sits in each launch's PresaleManager until
  // liquidity seeding moves it to the pair (or refunds return it)
  const raiseToken = await api.call({ abi: 'address:RAISE_TOKEN', target: factory })
  await api.sumTokens({ owners: launches.map(i => i.presaleManager), tokens: [raiseToken] })
  const lpStakings = launches.map(i => i.lpStaking)
  // the staked token is the launch token/WETH Uniswap v2 pair; zero address until liquidity is seeded
  const lpTokens = await api.multiCall({ abi: 'address:lpToken', calls: lpStakings })
  const ownerTokens = []
  const seeded = []
  lpTokens.forEach((lp, i) => {
    if (lp === nullAddress) return
    ownerTokens.push([[lp], lpStakings[i]])
    seeded.push({ pair: lp, presaleManager: launches[i].presaleManager })
  })
  // permanently locked liquidity: the LP minted at seeding is burned to the dead
  // address; count exactly the amount from each presale's LiquiditySeeded event
  const seedLogs = await sdk.util.runInPromisePool({
    items: seeded,
    concurrency: 10,
    processor: (launch) => getLogs2({ api, target: launch.presaleManager, eventAbi: liquiditySeededAbi, fromBlock: deployBlock }),
  })
  seedLogs.forEach((logs, i) => logs.forEach(log => api.add(seeded[i].pair, log.lpTokens)))
  return sumUnknownTokens({ api, ownerTokens, resolveLP: true, useDefaultCoreAssets: true })
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true, // staked LP is canonical Uniswap v2 pair liquidity, also counted in the uniswap listing
  start: '2026-07-18',
  methodology: 'Counts WETH contributed to active presales (held by each launch\'s PresaleManager), the permanently locked launch liquidity (LP minted at seeding and burned to the dead address, measured from each presale\'s LiquiditySeeded event), and Uniswap v2 LP tokens staked in each launch\'s LPStaking contract, all valued from pair reserves. Staked BWLK on Ethereum is counted under staking.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})

module.exports.ethereum.staking = staking(STAKED_BWLK_TRACKER, BWLK)
