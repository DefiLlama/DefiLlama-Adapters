const { nullAddress } = require('../helper/tokenMapping');
const { get } = require('../helper/http');
const abi = require('./abi.json');
const { json } = require('starknet');
const { ethers } = require('ethers');
const http = require('../helper/http');

const REPL_HELPER_CONTRACT = '0x65846aECBF23385F76B73ef1EDD1ebdFf7Ac258D';

const getAllValidAgents = async (api) => {
  const total = await api.call({ abi: abi.getAllAgentsCount, target: REPL_HELPER_CONTRACT })
  const COUNT = 30
  const loop = Math.ceil(total / COUNT)
  const query = new Array(loop)
    .fill(0)
    .map((item, i) => api.call({ abi: abi.getPagedAgents, target: REPL_HELPER_CONTRACT, params: [i * COUNT, COUNT] }))
  const lists = (await Promise.all(query)).reduce(
    (pre, cur) => [...pre, ...cur],
    []
  )
  return lists.filter(agent => !!agent.isValid)
}

// Total Assets of Miners pledged to the protocol
const getMinerAssets = (agents) => {
  return agents.reduce((sum, agent) => sum + +agent.minerBalance, 0);
};

module.exports = {
  filecoin: {
    tvl: async (api) => {
      const [tvlComponents, activeAgents] = await Promise.all([
        api.call({ abi: abi.getTVLComponents, target: REPL_HELPER_CONTRACT }),
        getAllValidAgents(api),
      ]);

      const minerAssets = getMinerAssets(activeAgents);
      api.add(nullAddress, minerAssets);
      api.add(nullAddress, tvlComponents);
    },
  },
};
