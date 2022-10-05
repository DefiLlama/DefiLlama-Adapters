const { kashiLending } = require("./kashi-lending.js");

const modulesToExport = {};
const kashi_chains = ["ethereum", "polygon", "bsc", "avax", "arbitrum"];

kashi_chains.forEach((chain) => {
  modulesToExport[chain] = {
    tvl: kashiLending(chain, false),
    borrowed: kashiLending(chain, true),
  };
});

module.exports = {
  misrepresentedTokens: true,
  ...modulesToExport,
};
