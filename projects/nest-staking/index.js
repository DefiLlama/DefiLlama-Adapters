const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const RWA_STAKING = "0xdbd03d676e1cf3c3b656972f88ed21784372acab"
const RESERVE_STAKING = "0xba0ae7069f94643853fce3b8af7f55acbc11e397"
const SBTC = "0x094c0e36210634c3CfA25DC11B96b562E0b07624"
const STONE = "0x7122985656e38bdc0302db86685bb972b145bd3c"

async function tvl(timestamp, block, chainBlocks, { api }) {
  const balances = {}
  
  // Get allowed stablecoins from RWA Staking
  const stablecoins = await api.call({
    target: RWA_STAKING,
    abi: 'function getAllowedStablecoins() view returns (address[])',
  })

  // Get SBTC and STONE total staked from Reserve Staking
  const sbtcStaked = await api.call({
    target: RESERVE_STAKING,
    abi: 'function getSBTCTotalAmountStaked() view returns (uint256)',
  })
  
  const stoneStaked = await api.call({
    target: RESERVE_STAKING,
    abi: 'function getSTONETotalAmountStaked() view returns (uint256)',
  })

  // Add SBTC and STONE balances
  balances[SBTC] = sbtcStaked
  balances[STONE] = stoneStaked

  // Get stablecoin balances from RWA Staking
  const tokensAndOwners = stablecoins.map(i => ([i, RWA_STAKING]))
  await sumTokens2({ balances, tokensAndOwners, api })

  return balances
}

module.exports = {
  methodology: "Counts total value locked in both RWA Staking (stablecoins) and Reserve Staking (SBTC and STONE) contracts",
  ethereum: { tvl }
}