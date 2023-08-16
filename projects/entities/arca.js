const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0x23A5eFe19Aa966388E132077d733672cf5798C03", //1.6m wANT staking
        "0xa66f8Db3B8F1e4c79e52ac89Fec052811F4dbd19", // 20,189.10 GMX staked
        "0xe05A884D4653289916D54Ce6aE0967707c519879"
    ],
  },
  polygon: {
    owners: [
        "0xa66f8Db3B8F1e4c79e52ac89Fec052811F4dbd19",      
    ],
  },
  arbitrum: {
    owners: [
        "0xa66f8Db3B8F1e4c79e52ac89Fec052811F4dbd19",      
    ],
  },
}
module.exports = cexExports(config)