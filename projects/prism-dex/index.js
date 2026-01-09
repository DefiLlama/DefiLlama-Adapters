const { uniV3Export } = require("../helper/uniswapV3");

module.exports = {
  methodology: "Counts TVL from all Uniswap V3 pools deployed via the factory contract at 0xef349aa6cc5e87559e716ac293845a48cadf30d5",
  start: 3520571,
  ...uniV3Export({
    megaeth: {
      factory: "0xef349aa6cc5e87559e716ac293845a48cadf30d5",
      fromBlock: 3520571,
    },
  })
};
