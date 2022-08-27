const { ApiPromise, WsProvider } = require("@polkadot/api");
const BigNumber = require("bignumber.js");

// node test.js projects/bifrost-dex/api.js

function formatToken(token) {
  switch (token) {
    case `{"Token":"RMRK"}`:
      return "RMRK";
    case `{"Token":"KSM"}`:
      return "KSM";
    case `{"VSToken":"KSM"}`:
      return "vsKSM";
    case `{"VToken":"KSM"}`:
      return "vKSM";
    case `{"Token":"KAR"}`:
      return "KAR";
    case `{"Token":"ZLK"}`:
      return "ZLK";
    case `{"Stable":"KUSD"}`:
      return "KUSD";
    default :
      return null;
  }
}

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

  const totalLiquidity = {};
  const totalLiquidityFormatted = {};

  // Get swap tvl
  const pools = await api.query.zenlinkProtocol.pairStatuses.entries();
  await Promise.all(pools.map(async (pool) => {
    if (pool[1].toHuman()?.Trading?.pairAccount) {
      const ttt = {};
      const poolAccountTokens = await api.query.tokens.accounts.entries(pool[1].toHuman()?.Trading?.pairAccount);
      const poolTokens = poolAccountTokens.filter(item => !item[0].toHuman()[1].LPToken);
      const currentToken = formatToken(JSON.stringify(poolTokens[0][0].toHuman()[1]));

      ttt[currentToken] = new BigNumber(poolTokens[0][1].toJSON().free).multipliedBy(2).toString();
      if (totalLiquidity[currentToken]) {
        totalLiquidity[currentToken] = new BigNumber(totalLiquidity[currentToken]).plus(new BigNumber(poolTokens[0][1].toJSON().free).multipliedBy(2)).toString();
      } else {
        totalLiquidity[currentToken] = new BigNumber(poolTokens[0][1].toJSON().free).multipliedBy(2).toString();
      }
    }
  }));

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
  methodology: "Liquidity Pools from Zenlink (only calculate the initiall Pool's liquidity).",
  bifrost: { tvl }
};