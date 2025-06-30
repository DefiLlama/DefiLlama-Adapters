// Import all Aria sub-protocols
const ariaApl = require('../aria-apl');

// Function to sum TVLs from all sub-protocols
async function tvl(api) {
  await ariaApl.sty.tvl(api);
}

// Function to sum staking from all sub-protocols
async function staking(api) {
  await ariaApl.sty.staking(api);
}

module.exports = {
  methodology: 'Aria Protocol ecosystem - all RWIP tokens summed.',
  start: 5630479, // Aria Launch (June 25, 2025)
  sty: {
    tvl,
    staking,
  },
  hallmarks: [
    [1750880683, "APL Launch"], // Jun 25 2025 12:44:43 PM PDT
  ],
};