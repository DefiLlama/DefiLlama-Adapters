const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  return sumTokens2({
    tokenAccounts: [
      // fragSOL Fund
      "C4EHVbBhbBGdxZNCJEuKWghYTTjwoPibwo1dcu74hvFM",
      "9aCT9JwuyXj9wzoabwRwgtpGBgDHfpmK8ncEzgRpGPM6",
      "4GzQxHyDdGrVPjEj1cz75R5TmrCkXHMCcUw1t9LpyDcK",
      "Fi69jARfww4TGod9ESLWfSqRf9Vq5vfFNy8K4V8uCGSN",
      "5S7qzbgAgWm1AWrm5zUqnoHisc1W72Bsb9CgunLBqu3q",
      // fragSOL NTP
      "HSKvv9UFCn4c6Jq3j8iiJfFgXFjRE6dr6QhWX2KD8gGU",
      "3KdpoeWuwaXLuukf56p8e1FtDKjY8pCmtZdmZejUctwP",
      "9grKYUmguSLVC9RHW1xKcLpiAphJrmcDkTVTCg9ebpFz",
      "EbMiibdEBswBKxATPtYEiaRcx7uzJvyWvexVzUJ6iyje",
      "A2WHeVfyxSF9jQSt7uhvwfvBUqFd7SCVMFbkhVf2rHTG",
      // fragJTO Fund
      "DvKHN9YNoWERUNcxpEfUvd1UmPwHjoDgyDiwWntMfba4",
      // Jito JTO Vault
      "3Fz1WVV7N3h5VScoveHyote6Y129F3Gmc3PcfnBuSbV3",
      // fragBTC Fund
      "B5eYu4dKBS8bTvLdeZungomcaQx52rDprdKEcyHzgbBD",
      "9fvyDGfUJta9ShCagSHZirWTX4TxU4aTQVc9ndUbSoCz",
      "C14KEN37y1jei1RFxcKLP46AQkgpUokEmp45GvX8Ch9P",
    ],
    solOwners: [
      "3H22A3T3CMyoGzAURZ4szV5Hmt64Dooo5g9Ns8h1kYy7",
    ]
  })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  solana: { tvl },
  methodology: 'TVL is calculated by summing all restaked assets.',
};
