const { sumTokens2 } = require("../helper/solana");

async function tvl() {
    return sumTokens2({
      tokenAccounts: [
        "CRFtzwkekKorgdTRSdvsYeqL1vEuVvwGRvweuWCyaRt3", // jitoSOL token account in kySOL Vault address
      ]
    })
}

module.exports = {
    timetravel: false,
    solana: { tvl },
    methodology: 'The TVL is calculated by summing all restaked assets.',
};
