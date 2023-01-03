const { sumChainTvls } = require("@defillama/sdk/build/generalUtil");
const v1 = require("./v1.js");
const v2 = require("./v2.js");

function buildExports() {
  let tvl = v1;
  const v1Chains = Object.keys(v1);

  Object.keys(v2).map(chain => {
    if (!v1Chains.includes(chain)) return;
    const v1Filters = Object.keys(tvl[chain]);

    Object.keys(v2[chain]).map(filter => {
      if (!v1Filters.includes(filter)) return;
      tvl[chain][filter] = sumChainTvls([
        tvl[chain][filter],
        v2[chain][filter]
      ]);
    });
  });

  return tvl;
}

module.exports = buildExports();
// node test.js projects/pendle/index.js
