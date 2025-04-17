const { sumTokens2, } = require('../helper/solana')

const tokenAccounts = {
  eclipse: [
    "3983hQGtV5FqqQrsVm6Mhw1Tn4BLuYYSaaSyQLRg4V5A"
  ],
  solana: [
    "CSHiqfGfP1ch2YmWoyjB2tNbdnuUw3o1WdgDaicgRdmM",
    "8ZYfToGSuKJiBEVSuzvoNmLJ9WC3mHAFz7SYDQBSfNbB",
    "CEBD6fsoNv7c7x3CV5HFm1JUnB7eVqpS9GhkksesnXc7",
    "icYHCTuFtkcRPpY4mxXXLJbZpsLMo9qL4xdySJafJCr",
    "pvVG7N97GBeHrY29QbUU8hVtbwdVJUTsU2zAFPredeV",
    "Fd788Rcsaj7Rda3rg8q63cSeTs3mesd7idqV64QugFGY",
    "AxmFbfzAHfzR7LSuBkKDUyEQnGm68HqdxGRkQJ2e4y63",
    "4ySzN7U4CNhp9WkpVexh1G1zPs5gmnejFVURP8UF5WQA",
    "EbWHbVL3SotgqGoj1wPEM7VSkqKSY2pUHtSNMe83HF2c",
    "RrpDctr3qkcJjfh6eM9PA5jhH1ZndDhtKBEvQ5jwM2p",
    "DazRVQErAofKnSS9L4vuR5MFLkAMHCF9BZiKTEQcKduC",
    "66i7W1q7Z4sQRuCbNPhGpmBkeiDj3zunEF3Z1GxLqc21"
  ]
}

async function tvl(api) {
  return sumTokens2({ tokenAccounts: tokenAccounts[api.chain], api, })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
  eclipse: { tvl, },
}
