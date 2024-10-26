const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xDE1617Ddb7C8A250A409D986930001985cfad76F", // usdc vault
          ADDRESSES.polynomial.SDAI, // sdai vault
          "0xC6cfb996A7CFEB89813A68CD13942CD75553032b", // susde vault
          "0x034cbb620d1e0e4C2E29845229bEAc57083b04eC" // eth bridge
        ],
        tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.SDAI, ADDRESSES.ethereum.sUSDe, nullAddress],
      }),
  },
  optimism: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xc374967634133F5Ed1DF5050276e5B33986625D3", // usdc vault
        ],
        tokens: [ADDRESSES.optimism.USDC_CIRCLE],
      }),
  },
  base: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x038bc0f438C6b46FaCc5C83475925F4Dc111d79F", // usdc vault
        ],
        tokens: [ADDRESSES.base.USDC],
      }),
  },
  arbitrum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          ADDRESSES.polynomial.SDAI, // usdc vault
        ],
        tokens: [ADDRESSES.arbitrum.USDC_CIRCLE],
      }),
  },
};
