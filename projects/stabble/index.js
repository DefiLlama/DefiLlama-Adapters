const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  return sumTokens2({
    owners: [
      "7HkzG4LYyCJSrD3gopPQv3VVzQQKbHBZcm9fbjj5fuaH",
      "7imnGYfCovXjMWKdbQvETFVMe72MQDX4S5zW4GFxMJME",
    ],
    getAllTokenAccounts: true,
  });
}

module.exports = {
  timetravel: false,
  solana: { tvl },
};
