const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
      "0x1368487BccEE27421c5b4a90A437Dbb8e8ea11CE", // hot
      "0xa853b3a5308f98926aa89821843f8299cc02eFC6", // hot - consolidation
      "0x19C8eD6602Ce31a51f2C9c28bD923847739f6175", // cold - user
      "0x14dC2b6E3bD3407718fA6320397D93897791b15E", // cold - house
    ],
  },
  bsc: {
    owners: [
      "0x1368487BccEE27421c5b4a90A437Dbb8e8ea11CE", // hot
      "0xa853b3a5308f98926aa89821843f8299cc02eFC6", // hot - consolidation
      "0x19C8eD6602Ce31a51f2C9c28bD923847739f6175", // cold - user
      "0x14dC2b6E3bD3407718fA6320397D93897791b15E", // cold - house
    ],
  },
  polygon: {
    owners: [
      "0x1368487BccEE27421c5b4a90A437Dbb8e8ea11CE", // hot
      "0xa853b3a5308f98926aa89821843f8299cc02eFC6", // hot - consolidation
      "0x19C8eD6602Ce31a51f2C9c28bD923847739f6175", // cold - user
      "0x14dC2b6E3bD3407718fA6320397D93897791b15E", // cold - house
    ],
  },
  scroll: {
    owners: [
      "0x1368487BccEE27421c5b4a90A437Dbb8e8ea11CE", // hot
      "0xa853b3a5308f98926aa89821843f8299cc02eFC6", // hot - consolidation
      "0x19C8eD6602Ce31a51f2C9c28bD923847739f6175", // cold - user
      "0x14dC2b6E3bD3407718fA6320397D93897791b15E", // cold - house
    ],
  },
  bitcoin: {
    owners: [
      "bc1qndz4wtssws2gle09wdmfn7evlr2424wa358pk3", // hot
      "bc1qu5keasldcnc8ce4x36r3053d3qyp3zgjmu2965", // hot - consolidation
      "bc1q6lkckg5zcjytjvjre447q52y684gl2jp8eel9r", // cold -  user
      "bc1q3gswjz6c8mdl5ulukk69dept4p93ascm96wzwc", // cold - house
    ],
  },
  solana: {
    owners: [
      "CmtxExQVhPKJ6z2FDpHWNVXFBhwywcXNjYB8WzpZGLKx", // hot
      "DyWrQZXx6EzjZ9b845Pm8awiDBgMuPtX1jHAgXD6w7Sw", // hot - consolidation
      "45R4S2Hc62tRRbgZhkgPC4fdn5f3h5Zj7oCA93yA5En6", // cold -  user
      "BwLnmeQErGN8TsvMFr2ywWhX6qAL74w1FMo5Z18qRzWD", // cold - house
    ],
  },
  avax: {
    owners: [
      "0x015a41879503c69d8556605c0526B9b5B59f9A2F", // hot
      "0xb078257c5Be10792eF922418AF0605E05d4a75a3", // hot - consolidation
      "0x2588a4500be528dD2e840dde05a29C0Dd3A11602", // cold -  user
      "0xDDDC6B2C8eEF13D8ab5189C8Ee14467072AE3d69", // cold - house
    ],
  },
  tron: {
    owners: [
      "TSjEMi9JjSJJCsDHHuUe9s63vHLNDTPLNc", // hot
      "TPDNKLR5723RkgcPBbAndTEicfYHwpxjgE", // hot - consolidation
      "TDMehmFFaohohtGJRKEsLq41Q6C91kT7DD", // cold -  user
      "TKLRWZ4PKZayHCAQsitJhLau4bXMyUJxhW", // cold - house
    ],
  },
 litecoin: {
    owners: [
      "ltc1q32k8z0glde0chd3wv0dc8ljnpl92ds8s2dlcc5", // hot
      "ltc1qw6q7h9aghdp5d3w9wx6748hk4zvntt9aq40ngw", // hot - consolidation
      "ltc1qf6zmte4muck3lyllpmu4q9h4e44r89777ry39z", // cold -  user
      "ltc1qwtf3grvr3t40axqgtxufk4sa66s3680749qlsl", // cold - house
    ],
  },
  ton: {
    owners: [
      "UQDn0QGegL3Y3ZvzDNcnFEx2YWJJ-T-wYBybMPy3Vcqbd4Nw", // hot
      "UQANrP4Du0abVt_zC9YuE-xizl4l99BrAqa5VP5Lz8OI5i4u", // hot - consolidation
      "UQCKucr3154bhH_3ZAeoeZTFnBnZjDMpi_IwDLwhE06wQVTI", // cold -  user
      "UQCeGI1w9wzP5atD_hUyA4cQN35QzItoHIc2JTEFT_3ZfEDV", // cold - house
    ],
  },
  doge: {
    owners: [
      "D6WMft6zfERAYorB3ftcJjhTintgeVAGhw", // hot
      "D63Ge381QBcsaf7qwuxBh5rttgRFdnxMcv", // hot - consolidation
      "DLBYdQkDyVWAcXxfkrXNPL9yE1gtKdKHbe", // cold -  user
      "DDXgUo6rPcJ5i3k1VmPAd1wWijmwfSPYEE", // cold - house
    ],
  },
  ripple: {
    owners: [
      "rnHYKxdnPFwHMc9wpARskAgJnYY1x6JZhu", // hot withdrawal
      "rfZS4yRkqTfaMKiFyUTsiF1TQ6dd67sAnK", // hot deposit
      "rhqxpAugGuwp6tYxy5jRmjc73468bSaaKS", // hot withdrawal - consolidation
      "rLPZ9JwjGQmuymo7NxUzf7eKFZCXhic7VW", // hot deposit - consolidation
      "rwW6g6iqyZHjmLiPdnwgYFBgeepQ4wbw73", // cold -  user
      "rHThQZRKbj4d5mbdKmzRukMBkkVSZsYxeR", // cold - house
    ],
  },
  injective: {
    owners: [
      "inj1accjy08x47jhng07vy24v5ugh6axak286rpkfd", // hot
      "inj1qfpajnc0ngtkng4uztxusrwzt0k5xg0ag0s6sf", // hot - consolidation
      "inj1jm7qwm6ykhesgh3wz65gtncyj2sl0j9ln842sq", // cold -  user
      "inj1xl77fmp2fgvrmh5vmet52tfdumg5tqw05vlexp", // cold - house
    ],
  },
  stellar: {
    owners: [
      "GAPFP3YN7BONOIUI47ROEMJ7ADQJN4EGHW6F2E25E4XZBF7OX24DHN77", // hot
      "GD6GEAG62FNBYUNOJGH2LAYOCC7RQLNSKA4VKIWXB5NJT6H7QT4OFDFO", // hot - consolidation
      "GAMHTYZE22J242FRVE7V56ULLQ7YGR7XCBHAUJLHU7AHZJQJAANIG72E", // cold -  user
      "GA4453WXKVNGBGGQOWC6NC27SYMDP7QJVVZ6LBZFG6Q57N7PUYXVLZYL", // cold - house
    ],
  }
}

module.exports = cexExports(config)
