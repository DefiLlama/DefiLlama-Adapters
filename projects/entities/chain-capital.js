const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0x4cF9faf73714b65B98557c822B6B514dfDa0E339",
        "0x2489146cf124A6900bA46c6F76f18eC76d5068b9"
    ],
  },
  polygon: {
    owners: [
        "0x4cF9faf73714b65B98557c822B6B514dfDa0E339",
    ],
  },
  bsc: {
    owners: [
        "0x2489146cf124A6900bA46c6F76f18eC76d5068b9"
    ],
  },
}

module.exports = cexExports(config)