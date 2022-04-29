const sdk = require("@defillama/sdk");
// In case BigInt is not available.
const BN = require("bn.js");

const ActivePoolABI = require("./abi/ActivePool.abi.json");
const DefaultPoolABI = require("./abi/ActivePool.abi.json");

const DECIMAL_PRECISION = new BN("1000000000000000000");

function getBNFromCallResponse(response) {
  if ("output" in response) {
    return new BN(response.output);
  }
  return new BN(0);
}

const CONTRACT_ADDRESSES = {
  // Pools holding ASTR.
  ACTIVE_POOL: "0x70724b57618548eE97623146F76206033E67086e",
  DEFAULT_POOL: "0x2fE3FDf91786f75C92e8AB3B861588D3D051D83F",
};

const CHAIN = "astar";

// Once BAI is listed on CoinGecko, add locked BAIs into the system as TVL.
async function getTotalASTRCollateralLockedInEthers(block) {
  const [
    activePoolASTRCollateralResponse,
    defaultPoolASTRCollateralResponse
  ] = await Promise.all([
    sdk.api.abi.call({
      chain: CHAIN,
      target: CONTRACT_ADDRESSES.ACTIVE_POOL,
      abi: ActivePoolABI.getCOL,
      block,
    }),
    sdk.api.abi.call({
      chain: CHAIN,
      target: CONTRACT_ADDRESSES.DEFAULT_POOL,
      abi: DefaultPoolABI.getCOL,
      block,
    })
  ]);
  let activePoolASTRCollateral = getBNFromCallResponse(activePoolASTRCollateralResponse);
  let defaultPoolASTRCollateral = getBNFromCallResponse(defaultPoolASTRCollateralResponse);
  return activePoolASTRCollateral.add(defaultPoolASTRCollateral).div(DECIMAL_PRECISION);
}

async function tvl(timestamp, block, chainBlocks) {
  const balances = {
    astar: (await getTotalASTRCollateralLockedInEthers(block)).toString()
  };

  return balances;
}

module.exports = {
  timetravel: true,
  start: 915830,
  methodology: "Total locked ASTR (in wrapped ERC-20 form) in ActivePool and DefaultPool",
  astar: {
    tvl,
  },
};
