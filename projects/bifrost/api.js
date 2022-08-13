const { ApiPromise, WsProvider } = require("@polkadot/api");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk")

// node test.js projects/bifrost/api.js
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

function formatToken(token) {
  switch (token) {
    case `{"Token":"RMRK"}`:
      return "RMRK";
    case `{"Token":"KSM"}`:
      return "KSM";
    case `{"VSToken":"KSM"}`:
      return "KSM";
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

  // Get swap tvl
  const pools = await api.query.zenlinkProtocol.pairStatuses.entries();
  await Promise.all(pools.map(async (pool) => {
    if (pool[1].toHuman()?.Trading?.pairAccount) {
      const poolAccountTokens = await api.query.tokens.accounts.entries(pool[1].toHuman()?.Trading?.pairAccount);
      poolAccountTokens.map(item => {
        const currentToken = formatToken(JSON.stringify(item[0].toHuman()[1]));
        if (currentToken) {
          if (totalLiquidity[currentToken]) {
            totalLiquidity[currentToken] = new BigNumber(totalLiquidity[currentToken]).plus(item[1].toJSON().free).toString();
          } else {
            totalLiquidity[currentToken] = new BigNumber(item[1].toJSON().free).toString();
          }
        }
      });
    }
  }));

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
  methodology: "1.Liquidity Pools from Zenlink (only calculate the initiall Pool's liquidity). 2.Minted vTokens from other chains (only calculate the underlying asset value)",
  bifrost: { tvl }
};