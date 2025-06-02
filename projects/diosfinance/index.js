const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const dios = "0x08eEcF5d03bDA3dF2467F6AF46b160c24D931DE7";
const diosStaking = "0x36c8a6E7436EDd850752E09539a519a369D95096";

const treasury = "0x98eE3F3629aCFA6fDDB49028C494030E5dFA349a";
const busd = ADDRESSES.bsc.BUSD;
const diosBusdLP = "0x2D7A5e9d85F62ADbaea9d48B11F5947F3AC57FC8";

module.exports = {
  ...ohmTvl(
    treasury,
    [
      [busd, false],
      [diosBusdLP, true],
    ],
    "bsc",
    diosStaking,
    dios
  ),
};
