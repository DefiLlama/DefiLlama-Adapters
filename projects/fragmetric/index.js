const { sumTokens2 } = require("../helper/solana");

async function tvl() {
    return sumTokens2({
      tokenAccounts: [
        "EVUJsmfM3cqh48eTrwmLe552F3pzmhRMJGVpmweg2fBt",
        "7HPaAWDuzsSEm4JZnRudJF11pNanPNfP5mqHUCkXh5kD",
        "BaoCDUcKbYSaxA5scygSeMNZV1GPsNeKqLwg92f9pi5v",
      ],
      solOwners: [
        "3TK9fNePM4qdKC4dwvDe8Bamv14prDqdVfuANxPeiryb",
      ]
    })
}

module.exports = {
    timetravel: false,
    solana: { tvl },
    methodology: 'TVL is calculated by summing all restaked assets.',
};
