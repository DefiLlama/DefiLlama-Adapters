const { sumTokensExport } = require("../helper/unwrapLPs");

const PWN_ALPHA_MAINNET = "0x45DB28b2d4878Ad124c037d4558AcF5Db3bBa6A5";
const PWN_BETA_MAINNET = "0xb98eFE56deCCeb1BeC9fAEeAF62500deb0953474";
const PWN_BETA_POLYGON = "0xaF0d978275a2e7e3109F8C6307Ffd281774C623E";
const PWN_BUNDLER_MAINNET = "0x19e3293196aee99BB3080f28B9D3b4ea7F232b8d";
const PWN_BUNDLER_POLYGON = "0xe52405604bF644349f57b36Ca6E85cf095faB8dA";
const PWN_V1_SIMPLE_LOAN = "0x50160ff9c19fbE2B5643449e1A321cAc15af2b2C";

module.exports = {
  misrepresentedTokens: true,
  methodology: `Sums up all the tokens deposited in the PWN Protocol. NFTs are resolved to their floor price using Chainlink price feeds.`,
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        PWN_ALPHA_MAINNET,
        PWN_BETA_MAINNET,
        PWN_BUNDLER_MAINNET,
        PWN_V1_SIMPLE_LOAN,
      ],
      resolveNFTs: true,
      resolveArtBlocks: true,
      resolveLPs: true,
    }),
  },
  // resolveNFTs: true is currently unsupported on Polygon
  // https://discord.com/channels/823822164956151810/823885412425793587/1139362819012304956
  polygon: {
    tvl: sumTokensExport({
      owners: [PWN_BETA_POLYGON, PWN_BUNDLER_POLYGON, PWN_V1_SIMPLE_LOAN],
    }),
  },
};
