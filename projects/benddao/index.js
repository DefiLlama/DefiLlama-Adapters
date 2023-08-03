const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { tvl, borrowed } = require("./helper/index");
const address = require("./helper/address");

module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL`,
  ethereum: {
    tvl,
    borrowed,
    staking: staking(address.ethereum.VeBend, address.ethereum.Bend,),
    pool2: staking(address.ethereum.StakedBUNI, address.ethereum.UniswapV2PairWETH,),
  },
};
