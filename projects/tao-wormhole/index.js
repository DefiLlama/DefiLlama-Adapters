// Canonical TAO on Solana: native TAO bridged from Bittensor via Wormhole's
// Native Token Transfer (NTT) and minted as an SPL token on Solana. The minted
// supply is backed 1:1 by TAO locked on the bridge, so TAO locked = SPL total
// supply. Read the mint supply (9 decimals) and value it as native TAO.
const { getTokenSupplies } = require('../helper/solana');

const TAO_MINT = 'taoC6xyv2v8tDLcev4uaGUgV4vdQsWJrGft2kcBRrBY';

async function tvl(api) {
  const supplies = await getTokenSupplies([TAO_MINT]);
  const raw = Number(supplies[TAO_MINT] || 0);
  api.addCGToken('bittensor', raw / 1e9);
}

module.exports = {
  timetravel: false,
  methodology:
    'TAO bridged to Solana, measured as the total supply of the canonical TAO SPL token (taoC6xyv2v8tDLcev4uaGUgV4vdQsWJrGft2kcBRrBY) minted 1:1 via Wormhole NTT against native TAO locked on the bridge, and priced as TAO.',
  solana: {
    tvl,
  },
};
