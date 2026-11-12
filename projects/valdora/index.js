const sdk = require('@defillama/sdk');

const cosmos = sdk.chains.cosmos;
const chain = 'zigchain';
const VALDORA_STAKER_CONTRACT = 'zig18nnde5tpn76xj3wm53n0tmuf3q06nruj3p6kdemcllzxqwzkpqzqk7ue55';

// historical runs query state at the block of the requested timestamp
// (the public LCD only retains a few weeks of state, older timestamps throw)
async function getBlock(api) {
  const isHistorical = api.timestamp && Date.now() / 1e3 - api.timestamp > 3600;
  if (!isHistorical) return undefined;
  if (api.block) return api.block;
  const { number } = await cosmos.getBlockAtTimestamp({ chain, timestamp: api.timestamp });
  return number;
}

async function fetchStakerAUM(api) {
  const { funds_raised } = await cosmos.queryContract({
    chain,
    contract: VALDORA_STAKER_CONTRACT,
    data: { funds_raised: {} },
    block: await getBlock(api),
  });
  api.add('azig', funds_raised);
}

async function tvl(api) {
  return fetchStakerAUM(api);
}

module.exports = {
  methodology: "Total ZIG deposited into Valdora liquid staking. The stZIG receipt token is excluded to avoid double-counting. Valdora Vaults (short-duration private credit) are real-world assets tracked on the RWA dashboard, not in TVL.",
  zigchain: { tvl },
};
