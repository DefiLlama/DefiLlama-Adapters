const { sumTokens2 } = require("../helper/solana");

async function tvl() {
    return sumTokens2({
      tokenAccounts: [
        "CRFtzwkekKorgdTRSdvsYeqL1vEuVvwGRvweuWCyaRt3", // jitoSOL token account in kySOL Vault address
        "HzwDsHJBtuSTRx3VV6bz1R8yrLywxKgfGte7FASXU8Gd", // JTO token account in kyJTO Vault address
      ]
    })
}

async function staking() {
  return sumTokens2({
    tokenAccounts: [
      "Ct8QS77TMFF98gvN1ZXrNjGqUmdkJQACi5Xi2sCTSC7D", // KYROS account in kyKYROS Vault address
    ]
  })
}

module.exports = {
    timetravel: false,
    doublecounted: true,
    solana: { tvl, staking },
    methodology: 'The TVL is calculated by summing all restaked assets.',
};
