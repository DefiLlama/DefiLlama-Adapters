const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  methodology: `Uses factory(0xA9a6E17a05c71BFe168CA972368F4b98774BF6C3) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  findora: {
    tvl: calculateUsdUniTvl(
      "0xA9a6E17a05c71BFe168CA972368F4b98774BF6C3",
      "findora",
      "0x0000000000000000000000000000000000001000",
      [
        "0x93EDFa31D7ac69999E964DAC9c25Cd6402c75DB3",
        "0x008A628826E9470337e0Cd9c0C944143A83F32f3",
        "0xABc979788c7089B516B8F2f1b5cEaBd2E27Fd78b",
        "0xdA33eF1A7b48beBbF579eE86DFA735a9529C4950",
        "0xE80EB4a234f718eDc5B76Bb442653827D20Ebb2d",
        "0x07EfA82E00E458ca3D53f2CD5B162e520F46d911"
      ],
      "findora"
    ),
  },
};