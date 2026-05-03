const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const POOL_MANAGER = "0x000000000004444c5dc75cB358380D2e3dE08A90";
const MDEX = "0xf0610eb7d8ee12d59412da32625d5e273e78ff0b";
const UNI_V4_POSITION_IDS = [
  "171422", "75342", "75341", "75339", "71766",
  "916590", "916589", "916588", "916583",
  "27478", "27477", "998", "995",
];

async function tvl(api) {
  return sumTokens2({
    api,
    resolveUniV4: true,
    owner: POOL_MANAGER,
    uniV4ExtraConfig: {
      positionIds: UNI_V4_POSITION_IDS,
      whitelistedTokens: [nullAddress, MDEX],
    },
  });
}

module.exports = {
  methodology: "TVL counts MDEX and ETH locked in protocol-owned Uniswap V4 positions.",
  doublecounted: true,
  ethereum: {
    tvl,
  },
};
