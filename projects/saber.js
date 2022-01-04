const { getTokenAccountBalance } = require("./helper/solana");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The data here comes directly from
// https://registry.saber.so/data/llama.mainnet.json
const utils = require("./helper/utils");

async function tvl() {
  const { data: saberPools } = await utils.fetchURL(
    "https://registry.saber.so/data/llama.mainnet.json"
  );

  const pools = await Promise.all(
    saberPools.map(
      async ({ reserveA, reserveB, tokenACoingecko, tokenBCoingecko }) => {
        for (let i = 0; i < 5; i++) {
          try {
            return [
              {
                coingeckoID: tokenACoingecko,
                amount: await getTokenAccountBalance(reserveA),
              },
              {
                coingeckoID: tokenBCoingecko,
                amount: await getTokenAccountBalance(reserveB),
              },
            ];
          } catch (e) {
            await sleep(1000);
            console.log(e);
          }
        }
        throw new Error(`Can't get data: ${reserveA}, ${reserveB}`);
      }
    )
  );

  return pools.flat().reduce((acc, pool) => {
    return {
      ...acc,
      [pool.coingeckoID]: (acc[pool.coingeckoID] ?? 0) + pool.amount,
    };
  }, {});
}

module.exports = {
  timetravel: false,
  tvl,
  methodology:
    'To obtain the TVL of Saber we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the tokens are found. TVL is calculated using the list of pool addresses found under the "Pools" button of the Saber App. These pools addresses are hard-coded. Making these calls returns the amount of tokens held in each contract. We then use Coingecko to get the price of each token in USD and export the sum of all tokens. "USDP" is used to price the stablecoin "PAI" since it has not been listed on Coingecko.',
};
