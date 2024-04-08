const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");
const { gql, request } = require("graphql-request"); // GraphQLClient

const CHAIN = "polygon";
const START_BLOCK = 55129443;
const PROTOCOL_ADDRESSES = ["0xbFeb0b78f9AB8223657B65c5aCAD846c12F8AA89"];
const USDC_TOKEN_ADDRESS = ADDRESSES.polygon.USDC_CIRCLE;
const TRACKED_TOKENS = [
  "0x01d6d93feaa0a7157b22cf034d09807e63d1e3d8", // SUGR
];
const THEGRAPTH_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-polygon";
const LAST_SWAP_QUERY = gql`
  query trades($tokenIn: String!, $tokenOut: String!) {
    swaps(
      where: { tokenIn: $tokenIn, tokenOut: $tokenOut }
      orderBy: timestamp
      orderDirection: desc
      first: 1 # block: {number: $block}
    ) {
      amountIn
      amountOut
    }
  }
`;

async function getConversion(fromToken, toToken, block) {
  const data = await request(THEGRAPTH_ENDPOINT, LAST_SWAP_QUERY, {
    block: block,
    tokenIn: fromToken,
    tokenOut: toToken,
  });
  // Get the Last Traded Price of the Token against USDC for conversion
  const swap = data["swaps"][0];
  if (swap === undefined) {
    console.error(
      `No swaps found for ${fromToken} to ${toToken} at block ${block}`
    );
    return 0;
  }
  return swap["amountOut"] / swap["amountIn"];
}

async function tvl(ts, _block, chainBlocks, { api }) {
  let usdcValue = 0;

  for (const token of TRACKED_TOKENS) {
    const rwaTokensPledged = (
      await sdk.api.erc20.balanceOf({
        target: token,
        owner: PROTOCOL_ADDRESSES[0],
        chain: CHAIN,
        block: chainBlocks[CHAIN],
        decimals: 0,
      })
    ).output;
    const conversionRate = await getConversion(
      token,
      USDC_TOKEN_ADDRESS,
      chainBlocks[CHAIN]
    );
    const tokenBalance = rwaTokensPledged;
    usdcValue += tokenBalance * conversionRate;
  }
  usdcValue = Math.round(usdcValue);
  api.add(USDC_TOKEN_ADDRESS, usdcValue.toString());
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  start: START_BLOCK,
  polygon: {
    tvl,
  },
};
