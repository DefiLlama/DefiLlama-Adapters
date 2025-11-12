const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0x1368487BccEE27421c5b4a90A437Dbb8e8ea11CE",
        "0xa853b3a5308f98926aa89821843f8299cc02eFC6",
    ],
  },
  bitcoin: {
    owners: [
        "bc1qndz4wtssws2gle09wdmfn7evlr2424wa358pk3",
        "bc1qu5keasldcnc8ce4x36r3053d3qyp3zgjmu2965",
    ],
  },
  solana: {
    owners: [
      "CmtxExQVhPKJ6z2FDpHWNVXFBhwywcXNjYB8WzpZGLKx",
      "DyWrQZXx6EzjZ9b845Pm8awiDBgMuPtX1jHAgXD6w7Sw",
    ],
  },
  avax: {
    owners: [
      "0x015a41879503c69d8556605c0526B9b5B59f9A2F",
      "0xb078257c5Be10792eF922418AF0605E05d4a75a3",
    ],
  },
  tron: {
    owners: [
      "TSjEMi9JjSJJCsDHHuUe9s63vHLNDTPLNc",
      "TPDNKLR5723RkgcPBbAndTEicfYHwpxjgE",
    ],
  },
 litecoin: {
    owners: [
        "ltc1q32k8z0glde0chd3wv0dc8ljnpl92ds8s2dlcc5",
        "ltc1qw6q7h9aghdp5d3w9wx6748hk4zvntt9aq40ngw",
    ],
  },
  ton: {
    owners: [
        "UQDn0QGegL3Y3ZvzDNcnFEx2YWJJ-T-wYBybMPy3Vcqbd4Nw",
        "UQANrP4Du0abVt_zC9YuE-xizl4l99BrAqa5VP5Lz8OI5i4u",
    ],
  },
  doge: {
    owners: [
      "D6WMft6zfERAYorB3ftcJjhTintgeVAGhw",
      "D63Ge381QBcsaf7qwuxBh5rttgRFdnxMcv",
    ],
  },
  ripple: {
    owners: [
      "rnHYKxdnPFwHMc9wpARskAgJnYY1x6JZhu",
      "rhqxpAugGuwp6tYxy5jRmjc73468bSaaKS",
    ],
  },
  bsc: {
    owners: [
      "0x1368487BccEE27421c5b4a90A437Dbb8e8ea11CE",
      "0xa853b3a5308f98926aa89821843f8299cc02eFC6",
    ],
  },
}

module.exports = cexExports(config)
