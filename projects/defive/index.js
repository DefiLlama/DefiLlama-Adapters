const { request, gql } = require('graphql-request');
const { uniTvlExport } = require('../helper/calculateUniTvl.js');
const sdk = require('@defillama/sdk');

// Sonic Network Addresses
const factory = '0x47524ca6578E172878aBf6fD6f3E1Cd106c551e6';  // Replace with DeFive's factory contract
const fiveToken = '0x4aDe5608127594CD9eA131f0826AEA02FE517461';  // FIVE token address
const masterFarmer = '0x4aDe5608127594CD9eA131f0826AEA02FE517461';  // MasterFarmer contract on Sonic

// Subgraph URL (Replace with actual deployed URL)
const SUBGRAPH_URL = 'https://gateway.thegraph.com/api/d5b76dbe5cf10940fadf422018d45684/subgraphs/id/DJpniEjry879CJGYXnvryurMGbGZdY4gpT4faVUh4KdZ';

// GraphQL Query to Get the Latest Daily Trading Volume
const query = gql`
  {
    deFiveDayDatas(first: 1, orderBy: date, orderDirection: desc) {
      dailyVolumeUSD
    }
  }
`;

// Fetch **Daily Fees** (0.18% of daily trading volume)
async function fees() {
  const balances = {};
  try {
    const data = await request(SUBGRAPH_URL, query);
    const dailyVolume = parseFloat(data.deFiveDayDatas[0]?.dailyVolumeUSD || 0);
    const totalFees = dailyVolume * 0.0018; // 0.18% swap fee

    sdk.util.sumSingleBalance(balances, 'sonic:usd', totalFees);
  } catch (error) {
    console.error('Error fetching daily fees:', error);
  }
  return balances;
}

// Fetch **Daily Revenue** (0.02% of daily trading volume - Dev Share)
async function revenue() {
  const balances = {};
  try {
    const data = await request(SUBGRAPH_URL, query);
    const dailyVolume = parseFloat(data.deFiveDayDatas[0]?.dailyVolumeUSD || 0);
    const devRevenue = dailyVolume * 0.0002; // 0.02% goes to devs

    sdk.util.sumSingleBalance(balances, 'sonic:usd', devRevenue);
  } catch (error) {
    console.error('Error fetching daily revenue:', error);
  }
  return balances;
}

// Fetch **TVL** (Total Value Locked in liquidity pools)
const tvl = uniTvlExport(factory, 'sonic', true);

// Fetch **Locked** (Governance-locked FIVE tokens)
async function locked(_, _b, _cb, { api }) {
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
    'TVL is calculated using the factory contract. "Locked" fetches `totalLockedAmount()` from MasterFarmer for governance-locked FIVE tokens. "Fees" (0.18% of swaps) and "Revenue" (0.02% dev share) are calculated using daily trading volume from the DeFive subgraph.',
  sonic: {
    tvl,
    locked,
    fees,
    revenue,
  },
};
