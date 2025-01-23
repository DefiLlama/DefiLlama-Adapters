const { getLogs } = require('../helper/cache/getLogs')
const MAFFIN_HUB = "0x6690384822afF0B65fE0C21a809F187F5c3fcdd8";

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: MAFFIN_HUB,
    topic: 'PoolCreated(address,address,bytes32)',
    eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, bytes32 indexed poolId)',
    onlyArgs: true,
    fromBlock: 15459725,
  })
  return api.sumTokens({ owner: MAFFIN_HUB, tokens: logs.map(log => log.token0).concat(logs.map(log => log.token1)), })
}
module.exports = {
  methodology: `Counts the tokens balances of the MaffinHub contract`,
  ethereum: {
    tvl,
  },
};
