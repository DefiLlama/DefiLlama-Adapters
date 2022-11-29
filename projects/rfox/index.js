const stakings = require("./stakings");
const pool2s = require("./pool2s")

module.exports = {
 methodology: "Counts Pools and Stakings on both Rfox and Vfox",
 ...stakings,
 bsc: {
  tvl: (async) => ({}),
  ...stakings.bsc,
  ...pool2s.bsc
 }
};

