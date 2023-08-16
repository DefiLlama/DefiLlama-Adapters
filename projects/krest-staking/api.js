const { ApiPromise, WsProvider } = require("@polkadot/api");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk")


function formatTokenAmount(amount, tokenSymbol) {
  let decimals = 18;

  switch (tokenSymbol) {
    case "DOT":
      decimals = 10;
      break;

    case "KSM":
      decimals = 12;
      break;

    case "ETH":
    case "KRST":
    case "PEAQ":
        // default value
        break;
    }

  return Number(amount / Number(10 ** decimals));
}

const tokenToCoingecko = {
  DOT: "polkadot",
  ETH: "ethereum",
  KSM: "kusama",
  PEAQ: "peaq",
  KRST: "krest",
};

function formatToken(token) {
  switch (token) {
    case '0':
      return "DOT";
    default :
      return null;
  }
}


async function tvl() {
  const provider = new WsProvider("wss://wss-krest.peaq.network");
  const api = new ApiPromise({ provider });
  await api.isReady;

  const totalLiquidity = {};

  // Get Krest Balances.locks.
  const balanceLocks = await api.query.balances.locks.entries();

  await Promise.all(balanceLocks.map(async (pool) => {
    const token=pool[0].toHuman()[0].Token||pool[0].toHuman()[0].Native
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
    methodology: "Staked tokens on Krest parachain.",
    krest: { tvl }
};
