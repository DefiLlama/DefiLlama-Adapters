const { staking } = require('../helper/staking');
const { buildOlympusTvl } = require('../helper/ohm');
const { ETH, chains } = require('./config');

const OHM_V1 = ETH.OHM_V1;
const OHM = ETH.OHM;
const GOHM = ETH.GOHM;

const OlympusStakings = [
  "0x0822F3C03dcc24d200AFF33493Dc08d0e1f274A2",
  "0xFd31c7d00Ca47653c6Ce64Af53c1571f9C36566a",
  "0xb63cac384247597756545b500253ff8e607a8020",
];

const olympusStaking = staking(OlympusStakings, [OHM, OHM_V1]);

const TREASURY_API = 'https://olympus-treasury-subgraph-prod.web.app/operations/latest/tokenRecords';

const CHAIN_MAP = {
  'Ethereum': 'ethereum',
  'Arbitrum': 'arbitrum',
  'Base': 'base',
  'Fantom': 'fantom',
  'Berachain': 'berachain',
};

function buildTvl(mode = 'tvl') {
  return buildOlympusTvl({
    chains,
    chainMap: CHAIN_MAP,
    treasuryApi: TREASURY_API,
    mode,
    defaultOwnTokens: [GOHM, OHM],
  });
}

function includeEthereumStaking(tvlFn) {
  return async function(api) {
    await tvlFn(api);
    await olympusStaking(api);
    return api.getBalances();
  };
}

const ethereumTreasuryTvl = buildTvl('tvl');
const ethereumTvl = includeEthereumStaking(ethereumTreasuryTvl);

const adapter = {
  start: '2021-03-24',
  timetravel: false,
  hallmarks: [
    ["2021-03-24", "Olympus Launch"],
    ["2021-10-19", "OHM v2 Migration begins"],
    ["2022-01-21", "Inverse Bonds"],
    ["2022-04-30", "Fei Protocol Hack"],
    ["2022-11-17", "Range-Bound Stability Launch"],
    ["2023-07-23", "Cooler Loans Launch"],
    ["2024-09-20", "Yield Repurchase Facility"],
    ["2024-10-01", "On-Chain Governance"],
    ["2024-11-20", "Emissions Manager Launch"],
    ["2025-01-15", "Cooler v2 Launch"],
    ["2025-12-01", "Convertible Deposits Launch"],
    ["2026-01-08", "CD Lending and Limit Orders"],
  ],
  methodology: "TVL includes Olympus treasury assets and OHM staked in Olympus staking contracts. Protocol-owned OHM held by treasury wallets and POL, including Uniswap V3 LP positions, are excluded from treasury balances. Olympus-owned OHM-family balances are reported under ownTokens, and Cooler Loans is tracked separately in the cooler-loans adapter.",
  ethereum: {
    tvl: ethereumTvl,
    staking: olympusStaking,
    ownTokens: buildTvl('ownTokens'),
  },
  arbitrum: {
    tvl: buildTvl('tvl'),
  },
  base: {
    tvl: buildTvl('tvl'),
  },
  fantom: {
    tvl: buildTvl('tvl'),
  },
  berachain: {
    tvl: buildTvl('tvl'),
  },
};

Object.defineProperty(adapter.ethereum, 'treasuryTvl', {
  value: ethereumTreasuryTvl,
});

module.exports = adapter;
