const { uniV3Export } = require("../helper/uniswapV3")

module.exports = {
  methodology: "TVL accounts for the liquidity on all AMM pools taken from the factory contract",
  ...uniV3Export({
    optimism: { factory: "0xe52a36Bb76e8f40e1117db5Ff14Bd1f7b058B720", fromBlock: 124982239 },
  })
}
