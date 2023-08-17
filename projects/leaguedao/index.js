const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const leag = "0x7b39917f9562C8Bc83c7a6c2950FF571375D505D";
const stakingContract = "0x67F60dA0F409AB8427e8a408efc4B137D0BD4e7B";
const yieldFarmStakingContract = "0x43921eb2E5C78D9e887d3Ecd4620a3Bd606f4F95";

//Tokens in Yield Farm Contract
const link = ADDRESSES.ethereum.LINK;
const snx = ADDRESSES.ethereum.SNX;
const ilv = "0x767fe9edc9e0df98e07454847909b5e959d7ca0e";
const sushi = ADDRESSES.ethereum.SUSHI;
const bond = "0x0391D2021f89DC339F60Fff84546EA23E337750f";
const xyz = "0x618679df9efcd19694bb1daa8d00718eacfa2883";
const ionx = "0x02d3a27ac3f55d5d91fb0f52759842696a864217";
const entr = "0xd779eea9936b4e323cddff2529eb6f13d0a4d66e";
const leagUsdc = "0x4708713b4b6bd32e41bcb2f9c5901d74fedba447";

module.exports = {
  ...ohmTvl(
    yieldFarmStakingContract,
    [
      [link, false],
      [snx, false],
      [ilv, false],
      [sushi, false],
      [bond, false],
      [xyz, false],
      [ionx, false],
      [entr, false],
      [leagUsdc, false],
    ],
    "ethereum",
    stakingContract,
    leag
  ),
};
