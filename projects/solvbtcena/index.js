const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
      "bc1q5pzsptd5whcljevzyztavuqru0hugd5ymgx5ezksdqug3ztrjvmqauys2q",
      "bc1q437jw8wqph854vf9dwxy4c2u6daveupjm5dqptj469gxw6vcpp0qfpr0mh"
    ],
  },
  ethereum: {
    tokensAndOwners: [
      ["0x4c9edd5852cd905f086c759e8383e09bff1e68b3", "0x464D0cCff5E05F2aFC69561Fd849e46d96492203"],
      ["0x4c9edd5852cd905f086c759e8383e09bff1e68b3", "0x94D9962C3942e7140D90449B6Cb92064AAf20595"]
    ]
  }
}

module.exports = cexExports(config)
