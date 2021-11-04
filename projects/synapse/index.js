const { chainExports } = require("../helper/exports");
const { request, gql } = require("graphql-request");
const { getBlock } = require("../helper/getBlock");
const { default: axios } = require("axios");
const sdk = require("@defillama/sdk");
const retry = require("async-retry");
const BigNumber = require("bignumber.js");
const { sumTokens } = require("../helper/unwrapLPs");

const TUSD = "0x0000000000085d4780b73119b644ae5ecd22b376";
const MIM_FANTOM = "0x82f0b8b456c1a451378467398982d4834b6829c1";
const gqlQuery = gql`
  query getTVL($block: Int) {
    swaps(block: { number: $block }) {
      tokens(orderBy: symbol, orderDirection: asc) {
        id
        name
        decimals
      }
      balances
    }
  }
`;

const changeNumDecimals = (number, toDecimals) => {
  return BigNumber(number)
    .div(10 ** toDecimals)
    .toFixed(0);
};

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const transform = (token) => `${chain}:${token}`;
    const balances = {};

    const block = await getBlock(timestamp, chain, chainBlocks);

    if (chain === "harmony") {
      const baseSwap = "0x080F6AEd32Fc474DD5717105Dba5ea57268F46eb";
      const nUSD = "0xED2a7edd7413021d440b09D654f3b87712abAB66";
      await sumTokens(
        balances,
        [
          [nUSD, "0x555982d2E211745b96736665e19D9308B615F78e"], // metaswap
          ["0xef977d2f931c1978db5f6747666fa1eacb0d0339", baseSwap],
          ["0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f", baseSwap],
          ["0x985458e523db3d53125813ed68c274899e9dfab4", baseSwap],
        ],
        chainBlocks.harmony,
        "harmony",
        (addr) => (addr === nUSD ? TUSD : `harmony:${addr}`)
      );

      return balances;
    }

    const { data } = await retry(
      async (_) => await axios.get("https://synapse.dorime.org/defillama.json")
    );

    const unsupportedTokens = data.unsupported;
    const tokens = data.bridges[chain];
    const url = data.subgraphs[chain];
    if (tokens === undefined || url === undefined) return balances;

    const { swaps } = await retry(
      async (_) => await request(url, gqlQuery, { block })
    );

    for (const swap of swaps) {
      // So it seems like our luck of ordering by `symbol` has ran out.
      // Time to start thinking like an ape now and sort this object
      // By moving MIM object to the front to be in 'union' with balance.
      if (chain == "fantom") {
        const mim = swap.tokens.filter((x) => {
          return x.id == MIM_FANTOM;
        });

        if (mim.length > 0) {
          swap.tokens = swap.tokens.filter((x) => x.id !== MIM_FANTOM);
          swap.tokens.unshift(mim[0]);
        }
      }
      if (chain === "arbitrum" && swap.tokens[0].name !== "nETH") continue;

      for (let i = 0; i < swap.tokens.length; i++) {
        if (swap.tokens[i].name == "USD LP") continue;

        // There is no data on price for `nUSD` so we change it to an obscure
        // stablecoin, which does have data on price but is not used in any of the pools.
        if (unsupportedTokens.includes(swap.tokens[i].name)) {
          swap.tokens[i].id = tokens.obscure;
          // Convert the decimals as well. (e.g 18d -> 6d)
          const decimals = swap.tokens[i].decimals - tokens["obscure-decimals"];
          if (decimals > 0)
            swap.balances[i] = changeNumDecimals(swap.balances[i], decimals);
        }

        sdk.util.sumSingleBalance(
          balances,
          transform(swap.tokens[i].id),
          swap.balances[i]
        );
      }
    }
    if (chain === "arbitrum") {
      const baseSwap = "0xbaFc462d00993fFCD3417aBbC2eb15a342123FDA";
      const nUSD = "0x2913e812cf0dcca30fb28e6cac3d2dcff4497688";
      await sumTokens(
        balances,
        [
          [nUSD, "0x84cd82204c07c67dF1C2C372d8Fd11B3266F76a3"], // metawap
          ["0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", baseSwap],
          ["0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", baseSwap],
          ["0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", baseSwap],
        ],
        chainBlocks.arbitrum,
        "arbitrum",
        (addr) => (addr === nUSD ? TUSD : `arbitrum:${addr}`)
      );
    }

    return balances;
  };
}

module.exports.misrepresentedTokens = true;
module.exports = chainExports(chainTvl, [
  "ethereum",
  "bsc",
  "polygon",
  "avax",
  "fantom",
  "arbitrum",
  "harmony",
]);
