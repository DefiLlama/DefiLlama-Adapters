const { sumTokensExport } = require("../helper/chain/ton");

const beeton = "0:91535482df135ffebdf7abc359ccbba0866bdd136d494582198f8a1129475129" //EQCRU1SC3xNf_r33q8NZzLughmvdE21JRYIZj4oRKUdRKRDb

const beetonHolders = [
  "EQDq-_byppqRdbCXE4mS2PyfB8xHTIFOsOtAC7eHXoZSD_yy", //Main token wallet address: token and nft
  "EQDzgrTfX9IfH6rAQhAtOsSj4v1J3aTWbXKUNJQ_vBuRTlMQ", //Team's wallet address
  "EQC6rf-8eJNz5h5ZBTdeUNvHf83uqwnTqLBso35rBISa89v6", //Marketing's wallet address
  "EQDDOPI6bdv9rYbTNYRNAVMiBNLTpSsQvxsr5Z1NKgtr_Q3q", //Listing's wallet address
  "EQDNydVAcvL1dbk_sE6KTx5QRvDBgjG3OZycFA1yWCcyk8LS", //NFT's wallet address
  "UQB4M_AbtopojI-EqoN9dfNZsSfFLcHZmYJQXP2_BIlazvxr", //Acquired Exton wallet
]

module.exports = {
  ton: {
    tvl: sumTokensExport({ owners: beetonHolders, tokens: [beeton], onlyWhitelistedTokens: true,})
  },
};
