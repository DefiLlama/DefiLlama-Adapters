const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs, getAddress } = require('../helper/cache/getLogs');

const config = {
  ethereum: { factory: '0x6e893ddfa75d67febb853e00f81c913c151bf9a9', fromBlock: 12599579 },
  bsc: { factory: '0x6e893ddfa75d67febb853e00f81c913c151bf9a9', fromBlock: 8142455 },
  arbitrum: { factory: '0x1e7db497d664e77fc96321a1ad0bf018e55cbff8', fromBlock: 218877 },
  polygon: { factory: '0x6e893ddfa75d67febb853e00f81c913c151bf9a9', fromBlock: 15508720 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xee193dabd87eb415480c4b61fae32c09068f2348d08b811bbf3a004404eae51b'],
        fromBlock,
      })
      const tokensAndOwners = logs.map((i) => {
        const token = getAddress(i.data.slice(64, 64 * 2 + 2));
        const pool = getAddress(i.data.slice(64 * 5, 64 * 6 + 2));
        return [token, pool];
      });
      return sumTokens2({ tokensAndOwners, api, })
    }
  }
})