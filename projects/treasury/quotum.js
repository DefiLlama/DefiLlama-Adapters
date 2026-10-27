const { sumTokensExport } = require('../helper/unknownTokens');

// Published TaxSink and NVDA: https://quotum.org/docs#contracts
const TAX_SINK = '0x42AbC7b64eD47dB6899b4F01Aa6c765c600a53a2';
const NVDA = '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC';

module.exports = {
  methodology: 'Gross NVDA held by the protocol TaxSink, reserved for inference funding and buybacks. This is a restricted protocol reserve, not unrestricted cash or user TVL. Excludes the team operations wallet, payment bridge, own-token holdings and staking deposits. Outstanding inference obligations are not deducted from this gross balance.',
  robinhood: {
    tvl: sumTokensExport({ tokensAndOwners: [[NVDA, TAX_SINK]] }),
  },
};
