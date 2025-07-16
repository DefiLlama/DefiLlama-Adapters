const sdk = require("@defillama/sdk");
const { getStorage, sumTokens2 } = require("../helper/chain/tezos");

async function tvl() {
  return sumTokens2({
    owners: [
      // v1 contracts
      "KT1GYKoownVC1ukP2TBDgKx7bSXRM5XkV1W6", // ꜰXTZ v1
      "KT1MX7D6ZJp2DDSSeDS96JPTFPXKkNiHFhwb", // ꜰUSDtz v1
      "KT1W8P4ZxD8eREKjDnxMe5882NP3GnAgrv46", // ꜰUSDt v1
      // v2 contracts
      "KT1MCXxbtS62tk4CUxv29BHnqTBtvsFFGzBm", // ꜰXTZ v2
      "KT1WQM7wj64GHCndwV8REccQ6N4tqZ3uRNqs", // ꜰUSDtz v2
      "KT1HCRJhfqmWKRJtZXzvTkY4iisfuR4w6pkB", // ꜰUSDt v2
      "KT19gZac3vqV3ZeMJbhMX7Xy8kcocKK4Tbz1", // ꜰtzBTC v2
    ],
    includeTezos: true,
  });
}

async function borrowed() {
  const markets = [
    { address: "KT1GYKoownVC1ukP2TBDgKx7bSXRM5XkV1W6", decimals: 6 }, // ꜰXTZ v1
    { address: "KT1MX7D6ZJp2DDSSeDS96JPTFPXKkNiHFhwb", decimals: 6 }, // ꜰUSDtz v1
    { address: "KT1W8P4ZxD8eREKjDnxMe5882NP3GnAgrv46", decimals: 6 }, // ꜰUSDt v1
    { address: "KT1MCXxbtS62tk4CUxv29BHnqTBtvsFFGzBm", decimals: 6 }, // ꜰXTZ v2
    { address: "KT1WQM7wj64GHCndwV8REccQ6N4tqZ3uRNqs", decimals: 6 }, // ꜰUSDtz v2
    { address: "KT1HCRJhfqmWKRJtZXzvTkY4iisfuR4w6pkB", decimals: 6 }, // ꜰUSDt v2
    { address: "KT19gZac3vqV3ZeMJbhMX7Xy8kcocKK4Tbz1", decimals: 8 }, // ꜰtzBTC v2
  ];

  const balances = {};

  for (const { address, decimals } of markets) {
    const storage = await getStorage(address);
    let borrows = Number(storage.totalBorrows || 0);
    let tokenAddress = storage.fa1_2_TokenAddress || storage.fa2_TokenAddress || "tezos";

    borrows = borrows / 10 ** decimals;

    const key = tokenAddress === "tezos" ? "tezos" : `tezos:${tokenAddress}`;
    sdk.util.sumSingleBalance(balances, key, borrows);
  }

  return balances;
}

module.exports = {
  timetravel: false,
  tezos: {
    tvl,
    borrowed,
  },
  methodology:
    'TVL includes all deposits in TezFin lending markets (ꜰXTZ, ꜰUSDtz, ꜰUSDt, ꜰtzBTC). Borrowed value is based on totalBorrows from contract storage, adjusted by token decimals.',
 };
