const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { tvl, borrowed } = require("./helper/index");
const address = require("./helper/address");

module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL`,
  ethereum: {
    tvl,
    borrowed,
    staking: staking(
      address.ethereum.VeBend,
      address.ethereum.Bend,
      "ethereum"
    ),
    pool2: pool2(
      address.ethereum.StakedBUNI,
      address.ethereum.UniswapV2PairWETH,
      "ethereum"
    ),
    treasury: staking(
      address.ethereum.Treasury,
      [address.ethereum.USDC, address.ethereum.ApeCoin],
      "ethereum"
    ),
  },
};
