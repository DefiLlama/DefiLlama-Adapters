const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xD6Ab33Ad975b39A8cc981bBc4Aaf61F957A5aD29) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  milkycow: {
    tvl: calculateUsdUniTvl(
      "0xD6Ab33Ad975b39A8cc981bBc4Aaf61F957A5aD29",
      "milkycow",
      "0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9",
      [
        "0xbd01b2CF2c514c7eC90827b8346354bb4f7832ab",
        "0xB44a9B6905aF7c801311e8F4E76932ee959c663C",
        "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844",
        "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8",
        "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D"
      ],
      "cardano"
    ),
  },
};