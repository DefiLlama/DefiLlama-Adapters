const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  const vaults = [
    "Hhed3wTHoVoPpnuBntGf236UfowMMAXfxqTLkMyJJENe", // SOL
    "BC5xAUpEbfeSWi5fJdvhFQhM3eMbTok2c7SY62daB3da", // USDC
    "FuFoCkfnrDjNmwPr54JEAYTUshXA4gQojevfvv3KXdx7", // ETH
    "55UmrYacpb8v7gbKswDofmWjLS8TSP3VB8NKjNfxu11d", // BTC
    "7b2jY9CeCWCnyKBvaLSnsV7qwUhbJGsJTPdyCsspPY7Q", // Virtual Pool - USDC
  ];

  return sumTokens2({ tokenAccounts: vaults });
}

module.exports = {
  timetravel: false,
  methodology:
    "tvl is the usd equivalent value of all the assets in our pools.",
  solana: {
    tvl
  },
};
