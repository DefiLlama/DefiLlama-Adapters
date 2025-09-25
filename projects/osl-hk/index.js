const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0x50de1986cf5befe0c8ee74d6df6dffe842dc2632",
        "0x92d2c650b8693323e7e8a3f0a0215c187911707a",
        "0x954d0a626abc84274a5c5f861522f36178dc8f4d",
    ],
  },
  bitcoin: {
    owners: [
        "358mMRwcxuCSkKheuVWaXHJBGKrXo3f6JW",
        "31m4rGmokAqWKb3R8ZvNJ2sjyFBtrRwh4Q",
    ],
  },
  litecoin: {
    owners: [
        "MQ9mZJu3X7m4CpMkvHia2nMRvY2q25kBA6",
        "MDUM7BPVDDTssV3D6hnKS35uu45zcUJUG9",
    ],
  },
  tron: {
    owners: [
      "TSA1Qox7hSfBdAc9JcYNtewoZeD4fukbNM",
      "TKFhkvMpvPNqYFtWjTAP3n5R7NgcGJwzSo",
      "TXVjExiDgZ8AUriM9J9ZEBooPRNy47Ftuc",
      "TXaLBmJwwb8hTPGGrvoWoFSaNv6PiGULSp",
    ],
  },
  ripple: {
    owners: [
      "r95CVf2nDKeyK8UPqNZTXefX4Wk8tqU4cQ",
      "r3GC3nruKu5KFj3xhZFZ59eDi1FFCgUMPy",
    ],
  },
  solana: {
    owners: [
      "94i35mzdbAHW9v6ikG8aD9dAVDQMtrorpB54yerZotpj",
      "DhEoMEppzLPdxNuZsqSpDQWcHX4K7cqeAnFJPNQjeoq",
    ],
  },
  ton: {
    owners: [
        "UQAw5IqcVhCHv4hF4fSq_WB6vuuMulb86tyTiYMpmDqtetGy",
        "UQD8mH9bP464QWAzcQl-e0XUepHKuSwLSLDcQs1VUWCe0Swb",
    ],
  },
  doge: {
    owners: [
      "D6BgG9CDJ3Xa43EsAeT5969bcitv5KtmwT",
      "DKSTo3dqY6GiTcx54mAQFEBitAWMmmtimF",
    ],
  },
  avax: {
    owners: [
      "0x483882580304223Ec7C14fE831bd637626D4b077",
      "0x7DC9F557E98e0a54d1F4eCa09898a2f339cCa064",
    ],
  },
  bsc: {
    owners: [
      "0x8506769D93208A2004c4a51E30c901f6064e4aE3",
      "0x1bfc0Ad0f2fb12Fb772711d3399885c7432Ffa6b",
    ],
  },
  bitcoincash: {
    owners: [
      "bitcoincash:qqtzeg448vf9tdhcdvguz5nf2pgvc78cw5fgzad4tz",
      "bitcoincash:qqfys07mea9d3zq4ht6yvr4td2thr2w3cgq9nsews5",
    ],
  },
  sei: {
    owners: [
      "0x4ecD4F080ab38A2C5543e795E171feCf5B7d5FD9",
      "0xDA613CA1432FCeEcD2DB9BdBf96F8D8726E42fCB",
    ],
  },
}

module.exports = cexExports(config)
