const { sumTokens2 } = require("../helper/solana");

async function tvl() {
    return sumTokens2({
      tokenAccounts: [
        "EVUJsmfM3cqh48eTrwmLe552F3pzmhRMJGVpmweg2fBt",
        "7HPaAWDuzsSEm4JZnRudJF11pNanPNfP5mqHUCkXh5kD",
        "BaoCDUcKbYSaxA5scygSeMNZV1GPsNeKqLwg92f9pi5v",
        "96h95Nkfy5SPu8ddb3V4b44CTNaZoWsKCCUXY8MKzn6Y",
        "DYyfr8fTAchSMZPm6nUu6MHARYVuCuvzwBQrroSW6mQm",
        "HakiuyCy3STaWaPtPUFyyHwEjzrRDGaLfqwV8kV6j1pn",
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
