const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xD6Ab33Ad975b39A8cc981bBc4Aaf61F957A5aD29) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  cronos: {
    tvl: calculateUsdUniTvl(
      "0xD6Ab33Ad975b39A8cc981bBc4Aaf61F957A5aD29",
      "milkomeda",
      "0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9",
      [
        "0x063A5E4cD5e15ac66ea47134Eb60e6b30A51B2bf",
        "0xB44a9B6905aF7c801311e8F4E76932ee959c663C",
      ],
      "cardano"
    ),
  },
}; // node test.js projects/milkyswap/index.js
