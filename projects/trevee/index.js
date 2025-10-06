const { sumTokens } = require('../helper/unwrapLPs');

// Contract address on Plasma
const TREVEE_CONTRACT = '0xd1E70089Bd036896B7454ED5dc5E74C656CC0F7a';

// USDT0 token address on Plasma
const USDT0_TOKEN = '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb';

// Fluid deposit token address on Plasma
const FLUID_DEPOSIT_TOKEN = '0x1DD4b13fcAE900C60a350589BE8052959D2Ed27B';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  // Count USDT0 and Fluid deposit token in the Trevee contract
  await sumTokens(
    balances,
    [
      [USDT0_TOKEN, TREVEE_CONTRACT],
      [FLUID_DEPOSIT_TOKEN, TREVEE_CONTRACT]
    ],
    chainBlocks.plasma,
    'plasma'
  );

  return balances;
}

module.exports = {
  methodology: 'Counts USDT0 deposits in Trevee vault contract on Plasma. Funds are deployed to Aave and Fluid protocols via Morpho for yield generation.',
  plasma: {
    tvl,
  },
};
