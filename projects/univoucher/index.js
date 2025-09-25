const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  ethereum: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 22714895,
  },
  base: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 31629302,
  },
  bsc: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 51538912,
  },
  polygon: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 72827473,
  },
  arbitrum: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 347855002,
  },
  optimism: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 137227100,
  },
  avax: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 63937777,
  },
};

Object.keys(config).forEach(chain => {
  const { owners, fromBlock } = config[chain]
  module.exports[chain] = { 
    tvl: sumTokensExport({ owners }), 
    start: fromBlock 
  }
})