const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
        "13uZyaPbt4rTwYQ8xWFySVUzWH3pk2P5c7"
    ],
  },
  ethereum:{
    owners: [
        "0x3cc936b795a188f0e246cbb2d74c5bd190aecf18",
        "0x0162cd2ba40e23378bf0fd41f919e1be075f025f",
        "0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88",
    ]
  },
  bsc: {
    owners:[
        "0x4982085c9e2f89f2ecb8131eca71afad896e89cb",
        "0x2e8f79ad740de90dc5f5a9f0d8d9661a60725e64"
    ]
  },
  polygon: {
    owners:[
        "0x51e3d44172868acc60d68ca99591ce4230bc75e0",
    ]
  },
  tron: {
    owners:[
        "TEPSrSYPDSQ7yXpMFPq91Fb1QEWpMkRGfn",
    ]
  },
  arbitrum: {
    owners:[
        "0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5",
    ]
  },
  optimism: {
    owners:[
        "0xdf90c9b995a3b10a5b8570a47101e6c6a29eb945",
    ]
  }
}

module.exports = cexExports(config)