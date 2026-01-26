const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  return sumTokens2({
    tokenAccounts: [
      // fragSOL Fund
      "9aCT9JwuyXj9wzoabwRwgtpGBgDHfpmK8ncEzgRpGPM6",
      "4GzQxHyDdGrVPjEj1cz75R5TmrCkXHMCcUw1t9LpyDcK",
      "Fi69jARfww4TGod9ESLWfSqRf9Vq5vfFNy8K4V8uCGSN",
      "5S7qzbgAgWm1AWrm5zUqnoHisc1W72Bsb9CgunLBqu3q",
      "Djcv4MmX85LQVwuWZYCvNd9ZXxTviWZJcbP9L86biCAa",
      "AWV3reX4HCLBMN7F5NcRB2HP2HR7MMGGE2LfWj3Yjhem",
      "CRrswq5CrraCvhPRT8sxpHKnKCP51st3EZBEv7Us1NNp",
      "9Y1yTf9Fsm7HhFtvaMCwzuBZs15uCQRCeVZDL1eFBm66",
      "8KLKztEJWukf6TG8EaRoLtqopS44YRfrFGpZokmHXaah",
      "2685SuzvAaa3MZFvTFzMGV45BWHRH4EX8ioz81g7B3hq",
      // fragSOL NTP
      "3KdpoeWuwaXLuukf56p8e1FtDKjY8pCmtZdmZejUctwP",
      "9grKYUmguSLVC9RHW1xKcLpiAphJrmcDkTVTCg9ebpFz",
      "EbMiibdEBswBKxATPtYEiaRcx7uzJvyWvexVzUJ6iyje",
      "A2WHeVfyxSF9jQSt7uhvwfvBUqFd7SCVMFbkhVf2rHTG",
      "GnA9nM3tRNJYYiVKaMPqVDsm5s7Smxvg6dmCpYM9htfi",
      "5ihib1oVWeQouE4aBzsi8TgfsjUHPfdzRVy16qf1xnTL",
      "BbBBQXfwL6wZ4sJm8GHYvrEyAx7EMotXwnAsZBrkLNQz",
      "BsSRHcnrdxPXDPwnFuhm7xPe6CuozbLfhT3kuNiW3J7j",
      "FqeGEjchLbCxydr7g2v9eJsJ4Vu45HqZPQMwfMoDTkp1",
      "HQLFnBwYuRVEjCdoZkC1hZFcxAhqZYHia5gccseB4bAa",
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
