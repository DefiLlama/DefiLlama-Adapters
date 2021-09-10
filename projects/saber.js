const { getTokenAccountBalance } = require("./helper/solana");

// The data here comes directly from
// https://registry.saber.so/data/llama.mainnet.json
const SABER_POOLS = require("./helper/saber-pools.json");

async function tvl() {
  const amounts = {};

  const pools = await Promise.all(
    SABER_POOLS.map(
      ({ reserveA, reserveB, tokenACoingecko, tokenBCoingecko }) => {
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
      }
    )
  );

  return pools.reduce((acc, pool) => {
    return {
      ...acc,
      [pool.coingeckoID]: (acc[pool.coingeckoID] ?? 0) + pool.amount,
    };
  });
}

module.exports = {
  tvl,
  methodology:
    'To obtain the TVL of Saber we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the tokens are found. TVL is calculated using the list of pool addresses found under the "Pools" button of the Saber App. These pools addresses are hard-coded. Making these calls returns the amount of tokens held in each contract. We then use Coingecko to get the price of each token in USD and export the sum of all tokens. "USDP" is used to price the stablecoin "PAI" since it has not been listed on Coingecko.',
};
