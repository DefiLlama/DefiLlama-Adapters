const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unknownTokens");

const PINA_TOKEN_CONTRACT = "0x02814F435dD04e254Be7ae69F61FCa19881a780D";
const PINA_DAO_CONTRACT = "0xd50B9219C832a762dd9a6929Dc4FeF988f65175b";
const PINA_LP_CONTRACT = "0x03083F4fE89b899C7887E26bE3E974EbBa11E591";
const PINA_DONTDIEMEME_CONTRACT = "0xe0bE1793539378cb87b6d4217E7878d53567bcfb";
const PINA_USDC_LP_CONTRACT = "0x58624E7a53700cb39772E0267ca0AC70f064078B";
const PINA_MEME_LP_CONTRACT = "0x713afa49478f1a33c3194ff65dbf3c8058406670";

module.exports = {
  methodology: "counts the number of tokens in Pina pool",
  start: '2023-01-17',
  ethereum: {
    tvl: () => 0,
    staking: staking(
      [PINA_DAO_CONTRACT, PINA_DONTDIEMEME_CONTRACT],
      PINA_TOKEN_CONTRACT
    ),
    pool2: sumTokensExport({
      owner: PINA_LP_CONTRACT,
      tokens: [PINA_USDC_LP_CONTRACT, PINA_MEME_LP_CONTRACT],
      resolveLPs: true,
      useDefaultCoreAssets: true,
    }),
  },
};
