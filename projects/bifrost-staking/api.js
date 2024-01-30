const { ApiPromise, WsProvider } = require("@polkadot/api");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk")

// node test.js projects/bifrost-staking/api.js

function formatTokenAmount(amount, tokenSymbol) {
  let decimals = 12;

  switch (tokenSymbol) {
    case "DOT":
      decimals = 10;
      break;

    case "BNC":
    case "KSM":
      decimals = 12;
      break;
    case "ETH":
    case "GLMR":
    case "MOVR":
    case "FIL":
    case "ASTR":
    case "MANTA":
      decimals = 18;
      break;
  }

  return Number(amount / Number(10 ** decimals));
}

const tokenToCoingecko = {
  DOT: "polkadot",
  BNC: "bifrost-native-coin",
  KSM: "kusama",
  MOVR: "moonriver",
  GLMR: "moonbeam",
  ETH: "ethereum",
  FIL: "filecoin",
  ASTR: "astar",
  MANTA: "manta-network"
};

function formatToken(token) {
  switch (token) {
    case '0':
      return "DOT";
    case '1':
      return "GLMR";
    case '4':
      return "FIL";
    case '3':
      return "ASTR";
    case '8':
      return "MANTA";
    default :
      return null;
  }
}


async function tvl() {
  const kusamaProvider = new WsProvider("wss://hk.bifrost-rpc.liebi.com/ws");
  const kusamaApi = await ApiPromise.create(({ provider:kusamaProvider }));

  const polkadotProvider = new WsProvider("wss://hk.p.bifrost-rpc.liebi.com/ws");
  const polkadotApi = await ApiPromise.create(({ provider:polkadotProvider }));

  const totalLiquidity = {};

  // Get kusama vToken tvl (vKSM / vMOVR / vBNC)
  const kusamaTokenPool = await kusamaApi.query.vtokenMinting.tokenPool.entries();
  // Get polkadot vToken tvl (vDOT / vGLMR / vASTR)
  const polkadotTokenPool = await polkadotApi.query.vtokenMinting.tokenPool.entries();

  await Promise.all(kusamaTokenPool.map(async (pool) => {
    const token=pool[0].toHuman()[0].Token||pool[0].toHuman()[0].Native
    totalLiquidity[token]=new BigNumber(totalLiquidity[token]||0).plus(pool[1].toString()).toString()
  }));

  await Promise.all(polkadotTokenPool.map(async (pool) => {
    const token=formatToken(pool[0].toHuman()[0].Token2)
    totalLiquidity[token]=new BigNumber(totalLiquidity[token]||0).plus(pool[1].toString()).toString()
  }));

  const totalLiquidityFormatted = {};
  for (const key in totalLiquidity) {
    totalLiquidityFormatted[tokenToCoingecko[key]] = formatTokenAmount(
      totalLiquidity[key],
      key
    );
  }

  return totalLiquidityFormatted;
}

module.exports = {
  timetravel: false,
  methodology: "Minted vTokens from other chains (only calculate the underlying asset value)",
  bifrost: { tvl }
};