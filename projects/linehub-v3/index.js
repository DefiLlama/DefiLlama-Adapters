const { uniV3GraphExport } = require("../helper/uniswapV3");

module.exports = {
  linea: {
    tvl: uniV3GraphExport({
      graphURL:
        "https://api.studio.thegraph.com/query/55804/linehub-v3/version/latest",
      name: "linehub/linehub-v3",
    }),
  },
};
