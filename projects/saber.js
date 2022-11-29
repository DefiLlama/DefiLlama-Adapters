const { sumTokens2, getGeckoSolTokens, getSolTokenMap } = require("./helper/solana");

// The data here comes directly from
// https://registry.saber.so/data/llama.mainnet.json
const utils = require("./helper/utils");

async function tvl() {
  const { data: saberPools } = await utils.fetchURL(
    "https://registry.saber.so/data/llama.mainnet.json"
  );
  const whitelistedTokens = await getGeckoSolTokens()
  const tokenMap = await getSolTokenMap()

  function isValidToken(token) {
    // if (!whitelistedTokens.has(token))  return false
    const isSaberToken = /saber/i.test(tokenMap[token]?.name ?? '')
    return !isSaberToken
  }

  const tokenAccounts = saberPools.map(i => {
    // filter out cashio dollars
    const res = []
    if (isValidToken(i.tokenA))
      res.push(i.reserveA)
    if (isValidToken(i.tokenB))
      res.push(i.reserveB)
    return res
  }).flat()
  return sumTokens2({ tokenAccounts })
}

module.exports = {
  hallmarks:[
    [1667865600, "FTX collapse"]
],
  timetravel: false,
  solana: { tvl },
  methodology:
    'To obtain the TVL of Saber we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the tokens are found. TVL is calculated using the list of pool addresses found under the "Pools" button of the Saber App. These pools addresses are hard-coded. Making these calls returns the amount of tokens held in each contract. We then use Coingecko to get the price of each token in USD and export the sum of all tokens. "USDP" is used to price the stablecoin "PAI" since it has not been listed on Coingecko.',
};
