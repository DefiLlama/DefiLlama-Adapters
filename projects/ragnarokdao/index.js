const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const treasury = "0xfa9cCe3098C02F770DcB2D17Df9B8f5331bE86D0";
const rgk = "0x46fccf447f74ec97a521615fce111118597071f7";
const stakingContract = "0xeb6B44834E002ECDEAdF9E61448B21cCc33284ca";
const mim = "0x130966628846bfd36ff31a822705796e8cb8c18d";
const usdc = ADDRESSES.avax.USDC_e;
const rgkMimJLP = "0xE8419ecDA1C76c38800b21e7D43BDB6B02f51ACE";
module.exports = {
  ...ohmTvl(
    treasury,
    [
      [mim, false],
      [usdc, false],
      [rgkMimJLP, true],
    ],
    "avax",
    stakingContract,
    rgk
  ),
};
