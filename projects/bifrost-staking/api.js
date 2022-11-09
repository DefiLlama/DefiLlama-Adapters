const { ApiPromise, WsProvider } = require("@polkadot/api");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk")

// node test.js projects/bifrost-staking/api.js

function formatTokenAmount(amount, tokenSymbol) {
  let decimals = 12;

  switch (tokenSymbol) {
    case "DOT":
    case "RMRK":
      decimals = 10;
      break;

    case "BNC":
    case "KSM":
    case "KAR":
    case "KUSD":
      decimals = 12;
      break;
    case "ETH":
    case "ZLK":
    case "MOVR":
      decimals = 18;
      break;
  }

  return Number(amount / Number(10 ** decimals));
}

const tokenToCoingecko = {
  DOT: "polkadot",
  BNC: "bifrost",
  KSM: "kusama",
  KAR: "karura",
  MOVR: "moonriver",
  KUSD: "tether",
  ZLK: "zenlink-network-token",
  RMRK: "rmrk",
  ETH: "ethereum"
};

async function tvl() {
  const provider = new WsProvider("wss://bifrost-rpc.liebi.com/ws");
  const api = await ApiPromise.create(({ provider }));

  // Get Salp tvl
  const vsKSM = (await api.query.tokens.totalIssuance({ "vsToken": "KSM" })).toString();
  const vsDOT = (await api.query.tokens.totalIssuance({ "vsToken": "DOT" })).toString();

  const totalLiquidity = {};
  totalLiquidity.KSM = vsKSM;
  totalLiquidity.DOT = vsDOT;

  // Get vToken tvl (vKSM / vMOVR )
  const tokenPool = await api.query.vtokenMinting.tokenPool.entries();

  await Promise.all(tokenPool.map(async (pool) => {
    const token=pool[0].toHuman()[0].Token||pool[0].toHuman()[0].Native
    totalLiquidity[token]=new BigNumber(totalLiquidity[token]||0).plus(pool[1].toString()).toString()
  }));

  // Get vETH tvl
  const { output: totalSupply } = await sdk.api.erc20.totalSupply({
    target: '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab'
  })
  totalLiquidity["ETH"] = totalSupply;

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