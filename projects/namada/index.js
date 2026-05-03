const { fetchURL } = require('../helper/utils');

const INDEXER = 'https://indexer.namada.validatus.com';
const FALLBACK_INDEXER = 'https://namada-mainnet-indexer.rpc.l0vd.com';

// NAM native token - excluded from TVL
const NAM_ADDRESS = 'tnam1q9gr66cvu4hrzm0sd5kmlnjje82gs3xlfg3v6nu7';

// Token address -> CoinGecko ID mapping (all 6 decimals, from namada-chain-registry)
const TOKEN_MAP = {
  'tnam1pkg30gnt4q0zn7j00r6hms4ajrxn6f5ysyyl7w9m': 'cosmos',              // ATOM
  'tnam1pklj3kwp0cpsdvv56584rsajty974527qsp8n0nm': 'celestia',             // TIA
  'tnam1p5z8ruwyu7ha8urhq2l0dhpk2f5dv3ts7uyf2n75': 'osmosis',             // OSMO
  'tnam1p5z5538v3kdk3wdx7r2hpqm4uq9926dz3ughcp7n': 'stride-staked-atom',  // stATOM
  'tnam1ph6xhf0defk65hm7l5ursscwqdj8ehrcdv300u4g': 'stride-staked-tia',   // stTIA
  'tnam1p4px8sw3am4qvetj7eu77gftm4fz4hcw2ulpldc7': 'stride-staked-osmo',  // stOSMO
  'tnam1pkl64du8p2d240my5umxm24qhrjsvh42ruc98f97': 'usd-coin',            // USDC
  'tnam1pk6pgu4cpqeu4hqjkt6s724eufu64svpqgu52m3g': 'neutron-3',           // NTRN
  'tnam1pk288t54tg99umhamwx998nh0q2dhc7slch45sqy': 'penumbra',            // UM
  'tnam1phv4vcuw2ftsjahhvg65w4ux8as09tlysuhvzqje': 'nym',                 // NYM
};

// All supported IBC tokens use 6 decimals (verified via namada-chain-registry).
// When adding new tokens, verify their decimal places before adding to TOKEN_MAP.
const DECIMALS = 6;

async function tvl(api) {
  let aggregates;
  try {
    const resp = await fetchURL(`${INDEXER}/api/v1/masp/aggregates`);
    aggregates = Array.isArray(resp) ? resp : resp.data;
  } catch (e) {
    const resp = await fetchURL(`${FALLBACK_INDEXER}/api/v1/masp/aggregates`);
    aggregates = Array.isArray(resp) ? resp : resp.data;
  }

  const netBalances = {};
  for (const entry of aggregates) {
    if (entry.timeWindow !== 'allTime') continue;
    const addr = entry.tokenAddress;
    if (addr === NAM_ADDRESS) continue;
    if (!TOKEN_MAP[addr]) continue;

    if (!netBalances[addr]) netBalances[addr] = BigInt(0);
    const amount = BigInt(entry.totalAmount);
    if (entry.kind === 'inflows') {
      netBalances[addr] += amount;
    } else if (entry.kind === 'outflows') {
      netBalances[addr] -= amount;
    }
  }

  for (const [addr, netRaw] of Object.entries(netBalances)) {
    if (netRaw <= 0n) continue;
    const cgId = TOKEN_MAP[addr];
    const amount = Number(netRaw) / Math.pow(10, DECIMALS);
    api.addCGToken(cgId, amount);
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the net balance of IBC tokens shielded in the Namada MASP (allTime inflows minus allTime outflows).',
  namada: { tvl },
};
