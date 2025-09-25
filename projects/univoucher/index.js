const { sumTokens2 } = require("../helper/unwrapLPs");
const { covalentGetTokens } = require('../helper/token');
const { getUniqueAddresses } = require('../helper/utils');

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

async function getTokens(api, owners) {
  let tokens = (await Promise.all(owners.map(i => covalentGetTokens(i, api, { onlyWhitelisted: false })))).flat()
  tokens = getUniqueAddresses(tokens)
  return tokens
}

Object.keys(config).forEach(chain => {
  const { owners, fromBlock } = config[chain]
  module.exports[chain] = { 
    tvl: async (api) => {
      const tokens = await getTokens(api, owners)
      return sumTokens2({ tokens, owners, api })
    },
    start: fromBlock 
  }
})

module.exports.methodology = "UniVoucher TVL is calculated by summing all ETH and ERC20 tokens held in the UniVoucher contract across all supported chains. These represent funds deposited into active (unredeemed/uncancelled) gift cards."