const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x70f51d68D16e8f9e418441280342BD43AC9Dff9f) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  metis: {
    tvl: calculateUsdUniTvl(
      "0x70f51d68D16e8f9e418441280342BD43AC9Dff9f",
      "metis",
      "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000",
      [
        "0xea32a96608495e54156ae48931a7c20f0dcc1a21", //usdc
        "0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc", //usdt
        "0x420000000000000000000000000000000000000a", //weth
        "0x90fe084f877c65e1b577c7b2ea64b8d8dd1ab278", //nett
        "0xf5f66d5daa89c090a7afa10e6c1553b2887a9a33", //link
        "0x87dd4a7ad23b95cd9ff9c26b5cf325905caf8663", //crv
        "0x5ce34d9abe4bf239cbc08b89287c87f4cd6d80b7", //mwow
        "0x80ffd7d26304b1443aa49ff35ae86e0b74077848", //mm
        "0xb453140460761f6e5e8f6d303f1a7c1fef3b7220", //str
        "0x1d94cc954fce49db542a61d68901f787b874cf4b", //alchi
      ],
      "metis-token"
    ),
  },
};