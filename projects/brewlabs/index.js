const { brewlabs } = require("./brewlabs.js");

const brewlabs_chains = ["ethereum", "polygon", "bsc"];

brewlabs_chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: brewlabs(chain),
  };
});
