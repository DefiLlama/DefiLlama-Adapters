const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require("../helper/chain/ton");
const TONYIELDING = 'EQAN0yTLUz7gGuM41LniwcdoKKLPYV0BCDPSxTSoqrlRSTAR';

module.exports = {
  methodology: 'Counts the number of TON in the Tonyielding contract.',
  ton: {
    tvl: (api) => sumTokens({ api, owners: [TONYIELDING], tokens: [ADDRESSES.null] }),
  }
};
