const { fetchURL } = require('../helper/utils');

// MASP account address on Namada
const MASP_ADDRESS = 'tnam1pcqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzmefah';
const INDEXER = 'https://indexer.namada.net';
const FALLBACK_INDEXER = 'https://indexer.namada.validatus.com';

// NAM native token - excluded from TVL
const NAM_ADDRESS = 'tnam1q9gr66cvu4hrzm0sd5kmlnjje82gs3xlfg3v6nu7';

// Token address -> CoinGecko ID (all 6 decimals, from namada-chain-registry)
const TOKEN_MAP = {
  'tnam1pkg30gnt4q0zn7j00r6hms4ajrxn6f5ysyyl7w9m': 'cosmos',             // ATOM
  'tnam1pklj3kwp0cpsdvv56584rsajty974527qsp8n0nm': 'celestia',            // TIA
  'tnam1p5z8ruwyu7ha8urhq2l0dhpk2f5dv3ts7uyf2n75': 'osmosis',            // OSMO
  'tnam1p5z5538v3kdk3wdx7r2hpqm4uq9926dz3ughcp7n': 'stride-staked-atom', // stATOM
  'tnam1ph6xhf0defk65hm7l5ursscwqdj8ehrcdv300u4g': 'stride-staked-tia',  // stTIA
  'tnam1p4px8sw3am4qvetj7eu77gftm4fz4hcw2ulpldc7': 'stride-staked-osmo', // stOSMO
  'tnam1pkl64du8p2d240my5umxm24qhrjsvh42ruc98f97': 'usd-coin',           // USDC
  'tnam1pk6pgu4cpqeu4hqjkt6s724eufu64svpqgu52m3g': 'neutron-3',          // NTRN
  'tnam1pk288t54tg99umhamwx998nh0q2dhc7slch45sqy': 'penumbra',           // UM
  'tnam1phv4vcuw2ftsjahhvg65w4ux8as09tlysuhvzqje': 'nym',                // NYM
};

const DECIMALS = 6;

async function tvl(api) {
  let balances;
  try {
    const resp = await fetchURL(`${INDEXER}/api/v1/account/${MASP_ADDRESS}`);
    balances = Array.isArray(resp) ? resp : resp.data;
  } catch (e) {
    const resp = await fetchURL(`${FALLBACK_INDEXER}/api/v1/account/${MASP_ADDRESS}`);
    balances = Array.isArray(resp) ? resp : resp.data;
  }

  for (const entry of balances) {
    const addr = entry?.token?.address;
    if (!addr || addr === NAM_ADDRESS) continue;
    if (!TOKEN_MAP[addr]) continue;

    const amount = Number(entry.minDenomAmount) / Math.pow(10, DECIMALS);
    if (amount <= 0) continue;
    api.addCGToken(TOKEN_MAP[addr], amount);
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the current balance of IBC tokens held in the Namada MASP account, sourced directly from the official Namada indexer.',
  namada: { tvl },
};
