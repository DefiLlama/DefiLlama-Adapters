const { uniTvlExport } = require('../helper/calculateUniTvl.js');
const sdk = require('@defillama/sdk');

// Sonic Network Addresses
const factory = '0x47524ca6578E172878aBf6fD6f3E1Cd106c551e6';  // Replace with DeFive's factory contract
const fiveToken = '0xb0695ce12c56AAe40894235e2d1888D0b62Dd110';  // FIVE token address
const masterFarmer = '0x4aDe5608127594CD9eA131f0826AEA02FE517461';  // MasterFarmer contract on Sonic

// Fetch **TVL** (Total Value Locked in liquidity pools)
const tvl = uniTvlExport(factory, 'sonic', true);

// Fetch **staking** (Governance-locked FIVE tokens)
async function staking(_, _b, _cb, { api }) {
  const balances = {};
  const totalLocked = await api.call({
    target: masterFarmer,
    abi: 'uint256:totalLockedAmount',
  });

  sdk.util.sumSingleBalance(balances, 'sonic:' + fiveToken, totalLocked);
  return balances;
}

module.exports = {
  methodology:
    'TVL is calculated using the factory contract. "staking" fetches `totalLockedAmount()` from MasterFarmer for governance-locked FIVE tokens.',
  sonic: {
    tvl,
    staking,
  },
};