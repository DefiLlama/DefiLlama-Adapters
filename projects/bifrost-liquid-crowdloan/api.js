const { ApiPromise, WsProvider } = require("@polkadot/api");

// node test.js projects/bifrost-liquid-crowdloan/api.js

function formatTokenAmount(amount, tokenSymbol) {
  let decimals = 12;
  switch (tokenSymbol) {
    case "DOT":
      decimals = 10;
      break;
    case "KSM":
      decimals = 12;
      break;
  }

  return Number(amount / Number(10 ** decimals));
}

const tokenToCoingecko = {
  DOT: "polkadot",
  KSM: "kusama",
};


async function tvl() {
  const kusamaProvider = new WsProvider("wss://hk.bifrost-rpc.liebi.com/ws");
  const kusamaApi = await ApiPromise.create(({ provider:kusamaProvider }));

  const polkadotProvider = new WsProvider("wss://hk.p.bifrost-rpc.liebi.com/ws");
  const polkadotApi = await ApiPromise.create(({ provider:polkadotProvider }));

  //Get Salp tvl
  const vsKSM = (await kusamaApi.query.tokens.totalIssuance({ "vsToken": "KSM" })).toString();
  const vsDOT = (await polkadotApi.query.tokens.totalIssuance({ "vsToken2": "0" })).toString();

  const totalLiquidity = {};
  totalLiquidity.KSM = vsKSM;
  totalLiquidity.DOT = vsDOT;

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