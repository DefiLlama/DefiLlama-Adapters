const llama = [
  {
    coingeckoID: "tether",
    account: "z7dYPG6f37n5DVt2tVzebdoXdvsnp1axj3iP3cTMtPk",
  },
  {
    coingeckoID: "usd-coin",
    account: "5U9E5wZZT4WeCswKCQ5xZ1JZJ33hGdmNjBJmkxQcrbTb",
  },
  {
    coingeckoID: "usdh",
    account: "6xVXwpwTkyLYkC3j8vHgX1zp7eUSB79f4ugjokKZTHVS",
  },
];

async function tvl() {
  return Promise.all(
    llama.map(async ({ coingeckoID, account }) => {
      return {
        coingeckoID,
        amount: await getTokenAccountBalance(account),
      };
    })
  );
}

module.exports = {
  methodology:
    "drachma exchange TVL is computed by looking at the balances of the accounts holding the tokens backing the drachma vault user. The data comes from https://drachma.exchange/pool.",
  tvl,
};
