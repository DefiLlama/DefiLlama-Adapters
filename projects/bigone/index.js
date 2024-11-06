const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
       '0xd4dcd2459bb78d7a645aa7e196857d421b10d93f',
       '0x88e343f4599292c2cffe683c1bb93cd3480bdbab',
       '0xa30d8157911ef23c46c0eb71889efe6a648a41f7'
    ],
  },
  bitcoin: {
    owners: [
        'bc1qu02z43yduyjx6saeea4l54qqulvz568qnzgaes',
        '1L5D4Eq2RkEKuN717Gc817MH1Sxs5WwMQh'
    ]
  },
  solana: {
    owners: [
        '7BCp5XUXtKzZWYCvGR2fzFqoyKiJ7ozN8eCEHscpSMnB'
    ]
  },
  tron: {
    owners: [
        'TNrPUjc47JU1fgaQZPa1odQnD5RTdH3NSu'
    ]
  },
}

module.exports = cexExports(config)