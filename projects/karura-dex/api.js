
const lksmToKsm = require("../karura-staking/lksmToKsm.js");
const { getKaruraAPI } = require('../helper/karura')
// node test.js projects/karura-dex/index.js
function formatTokenAmount(amount, tokenSymbol) {
  let decimals = 12;

  switch (tokenSymbol) {
    case "USD":
      decimals = 18;
      break;
    case "KSM":
    case "KAR":
    case "KUSD":
    case "BNC":
    case "LKSM":
      decimals = 12;
      break;
  }

  return Number(amount / Number(10 ** decimals));
}

const tokenToCoingecko = {
  KSM: "kusama",
  KAR: "karura",
  KUSD: "tether",
  BNC: "bifrost-native-coin",
};

async function tvl() {
  const api = await getKaruraAPI();

  // Get all of the entries of this storage.
  const pools = await api.query.dex.liquidityPool.entries();

  const totalLiquidity = {};

  for (const [pair, pairAmounts] of pools) {
    // For some reason the pairs come are nested in an array so I take them out.
    // toHuman puts them into an easy to use format for this
    const tokens = pair.toHuman()[0];

    // The values are in hex representation so I map them to int
    const amounts = pairAmounts.toJSON().map((v) => {
      return Number(v);
    });

    // Iterate over all of the token symbols and add them to the object
    for (const i in tokens) {
      let { Token } = tokens[i];

      let amount = amounts[i];
      if (Token === "LKSM") {
        Token = "KSM";
        amount = await lksmToKsm(api, amount);
      }

      if (totalLiquidity[Token]) {
        totalLiquidity[Token] = totalLiquidity[Token] + amount;
      } else {
        totalLiquidity[Token] = amount;
      }
    }
  }

  const totalLiquidityFormatted = {};

  // Iterate over all of the keys and format the amounts
  for (const key in totalLiquidity) {
    totalLiquidityFormatted[tokenToCoingecko[key]] = formatTokenAmount(
      totalLiquidity[key],
      key
    );
  }

  return totalLiquidityFormatted;
}

module.exports = {
  karura: { tvl },
};