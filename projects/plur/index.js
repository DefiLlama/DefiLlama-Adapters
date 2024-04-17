const { getLogs, getAddress } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const BUILDER_ADDRESS = '0x5dfee62C78A0E607CCE6A5d4458c328A03275ba2';
const WETH_ADDRESS = "0x4300000000000000000000000000000000000004"
const BUILDER_CREATE_BLOCK = 489054

async function tvl(_, _1, _2, { api }) {
  const createPoolLogs = await getLogs({
    api,
    fromBlock: BUILDER_CREATE_BLOCK,
    target: BUILDER_ADDRESS,
    topics: ["0x85e6dd046ca5129caaa517b25babd719637bb32968281fef3ede269234eb7250",],
  });
  const poolContracts = createPoolLogs.map((i) => getAddress(i.topics[1]));
  return sumTokens2({
    api: api,
    owners: poolContracts,
    token: WETH_ADDRESS
  })
}

module.exports = {
  timetravel: true,
  start: BUILDER_CREATE_BLOCK,
  blast: {
    tvl,
  }
}; 