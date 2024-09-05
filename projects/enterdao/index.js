const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const StakingContract = "0x3F148612315AaE2514AC630D6FAf0D94B8Cd8E33";
const yieldFarms = [
  ADDRESSES.ethereum.SUSHI, //SUSHI
  "0xbb0e17ef65f82ab018d8edd776e8dd940327b28b", //AXS
  "0x0391D2021f89DC339F60Fff84546EA23E337750f", //BOND
  "0x0f5d2fb29fb7d3cfee444a200298f468908cc942", //MANA
  "0x618679df9efcd19694bb1daa8d00718eacfa2883", //XYZ
  "0x767fe9edc9e0df98e07454847909b5e959d7ca0e", //ILV
  "0x3845badAde8e6dFF049820680d1F14bD3903a5d0", //SAND
  "0x83b546e10917432a722444672504f0d459472171", //SUSHI-LP
];


module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: sumTokensExport({ owner: StakingContract, tokens: yieldFarms, resolveLP: true, }),
  },
  methodology: "We count as TVL all the Yield Farms through Staking Contract",
};
