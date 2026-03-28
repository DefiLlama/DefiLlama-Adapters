const { treasuryExports } = require("../helper/treasury");
const { nullAddress } = require('../helper/tokenMapping');
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = treasuryExports({
  solana: {
    owners: [
      "DdKZZL4tiojQEdYDUFfBDJdMJ1ERwgk3TWRLKeS6pVKp",
      "Kewh32zffqXCaGufAQhag3BdamAS3FEsAyk9Yq3N2JK",
      "27Y4uEctsazLeiSoEe6Gr2YMxCdBhFfCHXP3afzkefhu",
      "FtY447zJHrcoPSGEYPbkrc3YeKYVRGgv8BkDyiP6Qm9x",
      "BJQbRiRWhJCyTYZcAuAL3ngDCx3AyFQGKDq8zhiZAKUw",
      "4EWqcx3aNZmMetCnxwLYwyNjan6XLGp3Ca2W316vrSjv",
      "CtL94wyS3rY5ZEnVWkXuKiP9K5HcH7XBdZ3ARAJqTy8C",
      "G8DM2iVAEAoeyAPNqwUVY6dga5Md78RsRzeVDEhn6onP",
      "7DWTwXVqcPEf6WkA8WNcqVCFYtvQE9RZMtHT1VvJCEcW",
      "CEvFzgEBKP3DY6Ue4kmMT2y25Le8nPpPtmAaY62pzjz2",
      "5zbWw84BDBtSjpngx1TFWBUHygzUHbPdP7aDPWomZrGP",
      "DAYifdw5kL5SP7SwR3YkFRDGqnX1auw85SrHA2oESrZp",
      "2Eg5WkWdnVYcoMYAH5UVmSQSWeE9pH2qDpXfRquxeF2C",
      "Gqoxsdoh8aebHwQXXDahAGvV9deS4TyfkVkY34oJxuAr",
      "6aYhxiNGmG8AyU25rh2R7iFu4pBrqnQHpNUGhmsEXRcm"
    ],// treasury addresses from ir.meteora.ag
    ownTokens: [
      'METvsvVRapdj9cFLzq4Tr43xK4tAjQfwX76z3n6mWQL'
    ],
    tokens: [
      nullAddress,
      ADDRESSES.solana.USDC,
      ADDRESSES.solana.SOL,
      ADDRESSES.solana.USDT,
      "59obFNBzyTBGowrkif5uK7ojS58vsuWz3ZCvg6tfZAGw",
      ADDRESSES.solana.JupSOL,
      "JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD",
      "1zJX5gRnjLgmTpq5sVwkq69mNDQkCemqoasyjaPW6jm",
      "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump",
      "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4",
      "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
      "G5bStqnKXv11fmPvMaagUbZi86BGnpf9zZtyPQtAdaos",
      "HUMA1821qVDKta3u2ovmfDQeW2fSQouSKE8fkF44wvGw"
    ]
  },
})
