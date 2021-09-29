const { ApiPromise, WsProvider } = require("@polkadot/api");
const { options } = require("@acala-network/api");

function formatTokenAmount(amount, tokenSymbol) {
  let decimals = 12;

  switch (tokenSymbol) {
    case "USD":
      decimals = 18;
      break;
    case "KSM":
    case "KAR":
    case "KUSD":
      decimals = 12;
      break;
  }

  return Number(amount)/(10**decimals)
}

const tokenToCoingecko = {
  KSM: "kusama",
  KAR: "karura",
  KUSD: "tether"
}


async function tvl() {
  const provider = new WsProvider("wss://karura-rpc-1.aca-api.network");
  const api = await ApiPromise.create(options({ provider }));

  // Get all of the entries of this storage.
  const pools = await api.query.dex.liquidityPool.entries();

  const totalLiquidity = {};

  for (const [pair, pairAmounts] of pools) {
    // For some reason the pairs come are nested in an array so I take them out.
    // toHuman puts them into an easy to use format for this 
    const tokens = pair.toHuman()[0];

    // The values are in hex representation so I map them to int
    const amounts = pairAmounts.toJSON().map(v => BigInt(v));

    // Iterate over all of the token symbols and add them to the object
    for (const i in tokens) {
      const { Token } = tokens[i];
      if (totalLiquidity[Token]) {
        totalLiquidity[Token] += amounts[i];
      } else {
        totalLiquidity[Token] = amounts[i];
      }
    }
  }

  const totalLiquidityFormatted = {};

  // Iterate over all of the keys and format the amounts
  for (const key in totalLiquidity) {
    totalLiquidityFormatted[tokenToCoingecko[key]] = formatTokenAmount(totalLiquidity[key], key);
  }

  return totalLiquidityFormatted;
}

module.exports={
  methodology:"Counts all liquidity on DEX pools. KUSD is counted as USDT",
  tvl
}