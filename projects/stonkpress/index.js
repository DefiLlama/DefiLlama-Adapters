const { unknownTombs } = require('../helper/unknownTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')

// StonkPress on Robinhood Chain: PAPER targets 0.0001 SPY, PLATE is the share token.
const PAPER = '0x008dd62dd934f3ffdc0986ba5316c78ae51cb1c9'
const PLATE = '0x5b00c30098216a00905ee3fb5bda413006418bb6'
const SPY = '0x117cc2133c37b721f49de2a7a74833232b3b4c0c'
const PAPER_SPY_LP = '0x6178406c433c70b006e2f81a79a5d98bf5b0af85'
const PLATE_SPY_LP = '0x73c4aae208080d94e97a0abe80f140a140846cc8'
const GENESIS_POOL = '0x935661973d9379b792bcb110d1eebd05034b838f' // pays PAPER
const REWARD_POOL = '0x55d8c2eb48cdcc1835dd38568f22feb6a0893d35' // pays oPLATE
const MASONRY = '0x8235508a182913b7eee538051d65ffd40dfe44bd' // PLATE staking

const POOL_INFO = {
  [GENESIS_POOL]: 'function poolInfo(uint256) view returns (address token, uint256 depFee, uint256 allocPoint, uint256 lastRewardTime, uint256 accPaperPerShare, bool isStarted, uint256 totalStaked, (bool isGauge, address gauge, address[] rewardTokens) gaugeInfo, uint256 poolPaperPerSec)',
  [REWARD_POOL]: 'function poolInfo(uint256) view returns (address token, uint256 depFee, uint256 allocPoint, uint256 lastRewardTime, uint256 accGpaperPerShare, bool isStarted, uint256 totalStaked, (bool isGauge, address gauge, uint8 gaugeDex) gaugeInfo, uint256 poolGpaperPerSec)',
}
const PROTOCOL_TOKENS = [PAPER, PLATE, PAPER_SPY_LP, PLATE_SPY_LP]

// Single-asset deposits (SPY, WETH, USDG and partner tokens) in both pools. PAPER, PLATE and their
// SPY LPs are left to pool2 and staking; this also drops the PAPER rewards the Genesis pool holds.
async function tvl(api) {
  const tokensAndOwners = []
  for (const pool of [GENESIS_POOL, REWARD_POOL]) {
    const infos = await api.fetchList({ lengthAbi: 'uint256:poolLength', itemAbi: POOL_INFO[pool], target: pool })
    infos.forEach(({ token }) => tokensAndOwners.push([token, pool]))
  }
  return sumTokens2({ api, tokensAndOwners, blacklistedTokens: PROTOCOL_TOKENS })
}

module.exports = unknownTombs({
  token: [PAPER],
  shares: [PLATE],
  rewardPool: [GENESIS_POOL, REWARD_POOL],
  masonry: [MASONRY],
  lps: [PAPER_SPY_LP, PLATE_SPY_LP],
  coreAssets: [SPY],
  chain: 'robinhood',
})
module.exports.robinhood.tvl = tvl
module.exports.methodology = 'TVL is single-asset deposits (SPY, WETH, USDG and partner tokens) in the Genesis and reward pools. Pool2 is PAPER/SPY and PLATE/SPY LP staked in those pools, and staking is PLATE in the Masonry; PAPER and PLATE are valued through their SPY pairs.'
