const ADDRESSES = require('../helper/coreAssets.json')

// Kal Mydas strategy vault pools deployed on Base mainnet (2026-05-01).
// Each KalPool holds USDC and allocates a fraction to an off-chain operator
// that routes positions through gTrade (Gains Network) on the XAU/USD pair.
const POOLS = [
    '0xe1Cd26c4017cbb66A1Ad6BAc95C3CDE67C24FBE3', // HORIZON
    '0x375CBbABC481Fb7bEb842D201E57A522e0FcF35B', // VALKYRIE
    '0x77Cd662165434C0Ab60ded459221f818EF31B58c', // REVOLUTION
    '0xd29Ef132b730802931FfBC7fAF0d5c0Ab12813c4', // TREASURY
    '0x4ec08709EB7F2251C4C8bf4867C2C7B9CdFC12Fb', // ORION
  ];

module.exports = {
    methodology:
          'TVL is the sum of USDC held by the five KalPool strategy vault contracts (HORIZON, VALKYRIE, REVOLUTION, TREASURY, ORION) on Base mainnet.',
    base: {
          tvl: (api) => api.sumTokens({ owners: POOLS, tokens: [ADDRESSES.base.USDC] }),
    },
};
