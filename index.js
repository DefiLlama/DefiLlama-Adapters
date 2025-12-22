const { masterchefExports } = require('../helper/masterchef');
const { staking } = require('../helper/staking');

const masterchef = "0xFa435cc7b37A1E3E404bBE082D48d83F2fAA3d10"; // LP Farm/MasterChef
const jadeToken = "0x330f4fe5ef44b4d0742fe8bed8ca5e29359870df"; 
const stakingPool = "0xa8D094c72a6F0047eE9D6Ba47E4d6DeFb879A853"; // Single JADE staking

// Auto-fetches LP pools from MasterChef (pools 0+)
const farmTvl = masterchefExports(masterchef, "bsc", false); // false = no double-count LP

module.exports = {
  methodology: "TVL counts JADE in single staking + staked JADE-WBNB LP value in farms",
  bsc: {
    tvl: farmTvl.tvl, // LP farms
    staking: staking(stakingPool, jadeToken), // single JADE staking
  },
};
