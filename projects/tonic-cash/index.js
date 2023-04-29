const { sumTokensExport } = require('../helper/unwrapLPs');
const config = require('./config.js');

Object.keys(config).forEach((chain) => {
  const tokensAndOwners = config[chain].flatMap(({ tokens, holders }) =>
    holders.flatMap(o => tokens.map(t =>  [t, o]))
  );
  module.exports[chain] = {
    tvl: sumTokensExport({ tokensAndOwners }),
  };
});
