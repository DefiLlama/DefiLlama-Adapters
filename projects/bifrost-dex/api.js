const { ApiPromise, WsProvider } = require("@polkadot/api");
const BigNumber = require("bignumber.js");
const sdk = require('@defillama/sdk')

// node test.js projects/bifrost-dex/api.js

function formatToken(token, type) {
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
    case `{"Token2":"0"}`:
      return type === "kusama" ? "USDT" : "DOT";
    case `{"Token2":"1"}`:
      return type === "kusama" ? "KINT" : "GLMR";
    case `{"VToken2":"0"}`:
      return "vDOT";
    case `{"VToken2":"4"}`:
      return "vFIL";
    case `{"Token2":"4"}`:
      return "FIL";
    case `{"VToken":"BNC"}`:
      return "vBNC";
    case `{"VToken":"MOVR"}`:
      return "vMOVR";
    default:
      return null;
  }
}

function formatTokenAmount(amount, tokenSymbol) {
  let decimals = 12;

  switch (tokenSymbol) {
    case "USDT":
      decimals = 6;
      break;

    case "vDOT":
    case "DOT":
    case "RMRK":
      decimals = 10;
      break;

    case "vBNC":
    case "BNC":
    case "KSM":
    case "KAR":
    case "KUSD":
      decimals = 12;
      break;
    case "ETH":
    case "ZLK":
    case "vMOVR":
    case "vGLMR":
    case "MOVR":
    case "GLMR":
    case "FIL":
    case "vFIL":
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
  KUSD: "acala-dollar",
  ZLK: "zenlink-network-token",
  USDT: "tether",
  FIL: "filecoin",
};

async function tvl() {
  const kusamaProvider = new WsProvider("wss://bifrost-rpc.liebi.com/ws");
  const kusamaApi = await ApiPromise.create(({ provider: kusamaProvider }));

  const totalLiquidity = {};
  const totalLiquidityFormatted = {};

  // Get swap tvl
  const kusamaPools = await kusamaApi.query.zenlinkProtocol.pairStatuses.entries();
  await Promise.all(kusamaPools.map(async (pool) => {
    if (pool[1].toHuman()?.Trading?.pairAccount) {
      const poolAccountTokens = await kusamaApi.query.tokens.accounts.entries(pool[1].toHuman()?.Trading?.pairAccount);
      const poolTokens = poolAccountTokens.filter(item => !item[0].toHuman()[1].LPToken);

      if (!poolTokens[0]) return;

      let currentToken = formatToken(JSON.stringify(poolTokens[0][0].toHuman()[1]), "kusama");
      const isVtoken = currentToken.startsWith("v");
      let ratio = 1;
      currentToken = isVtoken ? currentToken.slice(1) : currentToken;

      if (isVtoken) {
        const tokenPool = await kusamaApi.query.vtokenMinting.tokenPool(currentToken === "BNC" ? { "native": currentToken } : { "token": currentToken });
        const totalIssuance = await kusamaApi.query.tokens.totalIssuance({ "vToken": currentToken });
        ratio = new BigNumber(tokenPool).div(totalIssuance).toNumber();
      }

      if (totalLiquidity[currentToken]) {
        totalLiquidity[currentToken] = new BigNumber(totalLiquidity[currentToken]).plus(new BigNumber(poolTokens[0][1].toJSON().free).multipliedBy(2).multipliedBy(ratio)).toFixed().split(".")[0];
      } else {
        totalLiquidity[currentToken] = new BigNumber(poolTokens[0][1].toJSON().free).multipliedBy(2).multipliedBy(ratio).toFixed().split(".")[0];
      }
    }
  }));

  const polkadotProvider = new WsProvider("wss://hk.p.bifrost-rpc.liebi.com/ws");
  const polkadotApi = await ApiPromise.create(({ provider: polkadotProvider }));

  const polkadotPools = await polkadotApi.query.zenlinkProtocol.pairStatuses.entries();
  await Promise.all(polkadotPools.map(async (pool) => {
    if (pool[1].toHuman()?.Trading?.pairAccount) {
      const poolAccountTokens = await polkadotApi.query.tokens.accounts.entries(pool[1].toHuman()?.Trading?.pairAccount);
      const poolTokens = poolAccountTokens.filter(item => !item[0].toHuman()[1].LPToken);

      if (!poolTokens[0]) return;

      let currentToken = formatToken(JSON.stringify(poolTokens[0][0].toHuman()[1]), "polkadot");
      let ratio = 1;
      sdk.log(currentToken, poolTokens[0][0].toHuman())
      if (!currentToken) return;
      const isVtoken = currentToken.startsWith("v");
      currentToken = isVtoken ? currentToken.slice(1) : currentToken;

      if (isVtoken) {
        const tokenPool = await polkadotApi.query.vtokenMinting.tokenPool({ "token2": poolTokens[0][0].toHuman()[1].VToken2 });
        const totalIssuance = await polkadotApi.query.tokens.totalIssuance({ "vToken2": poolTokens[0][0].toHuman()[1].VToken2 });
        ratio = new BigNumber(tokenPool).div(totalIssuance).toNumber();
      }

      if (totalLiquidity[currentToken]) {
        totalLiquidity[currentToken] = new BigNumber(totalLiquidity[currentToken]).plus(new BigNumber(poolTokens[0][1].toJSON().free).multipliedBy(2).multipliedBy(ratio)).toFixed().split(".")[0];
      } else {
        totalLiquidity[currentToken] = new BigNumber(poolTokens[0][1].toJSON().free).multipliedBy(2).multipliedBy(ratio).toFixed().split(".")[0];
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