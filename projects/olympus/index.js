const { get } = require('../helper/http');
const { staking } = require('../helper/staking');

const OHM_V1 = "0x383518188c0c6d7730d91b2c03a03c837814a899";
const OHM = "0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5";
const GOHM = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";

const OlympusStakings = [
  "0x0822F3C03dcc24d200AFF33493Dc08d0e1f274A2",
  "0xFd31c7d00Ca47653c6Ce64Af53c1571f9C36566a",
  "0xb63cac384247597756545b500253ff8e607a8020",
];

const olympusTokens = [GOHM, OHM];

const TREASURY_API = 'https://olympus-treasury-subgraph-prod.web.app/operations/latest/tokenRecords';

const CHAIN_MAP = {
  'Ethereum': 'ethereum',
  'Arbitrum': 'arbitrum',
  'Base': 'base',
  'Fantom': 'fantom',
  'Berachain': 'berachain',
};

function buildTvl(mode = 'tvl') {
  return async function(api) {
    const { data: records } = await get(TREASURY_API);

    const chainKey = Object.keys(CHAIN_MAP).find(k => CHAIN_MAP[k] === api.chain);
    if (!chainKey) return {};

    const ownTokenSet = new Set(olympusTokens.map(t => t.toLowerCase()));

    const chainRecords = records.filter(r => {
      if (r.blockchain !== chainKey) return false;
      // Exclude Protocol-Owned Liquidity — tracked by Uniswap V3 adapter to avoid double-counting
      if (r.category === 'Protocol-Owned Liquidity') return false;
      const isOwn = ownTokenSet.has(r.tokenAddress.toLowerCase());
      return mode === 'ownTokens' ? isOwn : !isOwn;
    });

    if (chainRecords.length === 0) return {};

    const tokens = [...new Set(chainRecords.map(r => r.tokenAddress))];
    const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens, permitFailure: true });
    const decimalMap = Object.fromEntries(tokens.map((t, i) => [t.toLowerCase(), decimals[i]]));

    for (const record of chainRecords) {
      const dec = decimalMap[record.tokenAddress.toLowerCase()];
      if (dec == null) continue;
      api.add(record.tokenAddress, Math.round(parseFloat(record.balance) * 10 ** dec));
    }
  };
}

module.exports = {
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
  methodology: "Treasury value from the Olympus treasury API excluding protocol-owned OHM and Protocol-Owned Liquidity. POL (Uniswap V3 LP positions) is excluded to avoid double-counting with the Uniswap V3 adapter. Cooler Loans debt is tracked by the dedicated cooler-loans adapter.",
  ethereum: {
    tvl: buildTvl('tvl'),
    staking: staking(OlympusStakings, [OHM, OHM_V1]),
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
