const { sumTokens2 } = require("../helper/solana");

async function tvl() {
    return sumTokens2({
      tokenAccounts: [
        "CRFtzwkekKorgdTRSdvsYeqL1vEuVvwGRvweuWCyaRt3", // jitoSOL token account in kySOL Vault address
        "HzwDsHJBtuSTRx3VV6bz1R8yrLywxKgfGte7FASXU8Gd", // JTO token account in kyJTO Vault address
      ]
    })
}

module.exports = {
    timetravel: false,
    doublecounted: true,
    solana: { tvl },
    methodology: 'The TVL is calculated by summing all restaked assets.',
};
