const { tombTvl } = require("../helper/tomb");

const elfTokenAddress = "0x300f03050271E33501973Ef00b320F4e9a1a68E2";
const giftTokenAddress = "0x1a01505f6D6f2d693efa06eA66a205c552f82818";
const giftRewardPoolAddress = "0xBB692cad44e39359b38299f63a13490Edb975CB3";
const boardroomAddress = "0xA57235aD899D686285726a8821A99C610Cd5eA78";
const usdcLPs = [
  "0x0AC627348E0b852A99b2F025E8b644033629DAA8", // elfUsdcLpAddress
  "0x0b450366b48b0B8D3a7D6157cf7DaFF7E216a635", //giftUsdcLpAddress
];

module.exports = {
    ...tombTvl(elfTokenAddress, giftTokenAddress, giftRewardPoolAddress, boardroomAddress, usdcLPs, "fantom", undefined, false, usdcLPs[1])
}