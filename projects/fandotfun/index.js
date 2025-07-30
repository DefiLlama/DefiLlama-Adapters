const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');

const FANDOTFUN_CONTRACT = '0x1Ce2521E11D1FF489BE872a4091fE423F4E4eA44';

async function tvl(api) {
  return sumTokens2({
    owners: [FANDOTFUN_CONTRACT],
    tokens: [nullAddress], // Use nullAddress for native token
    chain: 'hyperliquid',
    api,
  });
}

module.exports = {
  methodology:
    'Counts native HYPE held by the Fan.fun contract on Hyperliquid L1 using the sumTokens2 helper.',
  hyperliquid: {
    tvl,
  },
};
