const { staking } = require("../helper/staking");
const { tvl, borrowed } = require("./helper/index");
const address = require("./helper/address");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  ethereum: {
    tvl,
    borrowed,
    staking: staking(address.ethereum.VeBend, address.ethereum.Bend,),
    pool2: staking(address.ethereum.StakedBUNI, address.ethereum.UniswapV2PairWETH,),
  },
};
