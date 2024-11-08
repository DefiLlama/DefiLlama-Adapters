const { sumTokens2 } = require("../helper/solana");

async function tvl() {
    return sumTokens2({
      tokenAccounts: [
        "4b3xtGBwmP9FQyQ85HDmyEtQrLdoVzz6NBwBjaRBzJuS",
        "BXUyJdESgoyssvATKa3omD7zHtdeztpWnG13mDUQ6fcM",
        "B2vjfDaLsaJ32ESoFsVf7NPS2hd5f4QisiPLiXBrS1BK",
        "HSKvv9UFCn4c6Jq3j8iiJfFgXFjRE6dr6QhWX2KD8gGU",
        "3KdpoeWuwaXLuukf56p8e1FtDKjY8pCmtZdmZejUctwP",
        "9grKYUmguSLVC9RHW1xKcLpiAphJrmcDkTVTCg9ebpFz",
      ],
      solOwners: [
        "3H22A3T3CMyoGzAURZ4szV5Hmt64Dooo5g9Ns8h1kYy7",
      ]
    })
}

module.exports = {
    timetravel: false,
    solana: { tvl },
    methodology: 'TVL is calculated by summing all restaked assets.',
};
