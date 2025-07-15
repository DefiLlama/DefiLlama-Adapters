// Sonic Network Addresses
const factory = '0x47524ca6578E172878aBf6fD6f3E1Cd106c551e6';  // Replace with DeFive's factory contract
const fiveToken = '0xb0695ce12c56AAe40894235e2d1888D0b62Dd110';  // FIVE token address
const masterFarmer = '0x4aDe5608127594CD9eA131f0826AEA02FE517461';  // MasterFarmer contract on Sonic


// Fetch **staking** (Governance-locked FIVE tokens)
async function staking(api) {
  const totalLocked = await api.call({
    target: masterFarmer,
    abi: 'uint256:totalLockedAmount',
  });

  api.add(fiveToken, totalLocked)
}


const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'sonic': factory
})

module.exports.sonic.staking = staking