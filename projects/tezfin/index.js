const sdk = require("@defillama/sdk");
const { getStorage, sumTokens2 } = require("../helper/chain/tezos");

async function tvl() {
  return sumTokens2({
    owners: [
      "KT1GYKoownVC1ukP2TBDgKx7bSXRM5XkV1W6",
      "KT1MX7D6ZJp2DDSSeDS96JPTFPXKkNiHFhwb",
      "KT1W8P4ZxD8eREKjDnxMe5882NP3GnAgrv46"
    ], 
    includeTezos: true,
  });
}

async function borrowed() {
  const borrowedTokensAddresses = [
    "KT1GYKoownVC1ukP2TBDgKx7bSXRM5XkV1W6",
    "KT1MX7D6ZJp2DDSSeDS96JPTFPXKkNiHFhwb",
    "KT1W8P4ZxD8eREKjDnxMe5882NP3GnAgrv46"
  ];

  const balances = {};

  for (const address of borrowedTokensAddresses) {
    const storage = await getStorage(address);
    let token_borrows = storage.totalBorrows;
    let token_address = '';

    if (storage.fa1_2_TokenAddress) {
      token_address = storage.fa1_2_TokenAddress;
    } else if (storage.fa2_TokenAddress) {
      token_address = storage.fa2_TokenAddress;
    } else {
      token_address = "tezos";
      token_borrows = token_borrows / 1e6; // Divide by 1e6 if the token address is "tezos"
    }

    sdk.util.sumSingleBalance(balances, `tezos:${token_address}`, token_borrows);
  }

  return balances;
}

module.exports = {
  timetravel: false,
  tezos: {
    tvl,
    borrowed,
  },
  methodology: 'TVL counts the liquidity and reserves for each market. Borrowed amounts are calculated based on the total borrows from each contract address, with special handling for "tezos" to adjust for precision.',
};