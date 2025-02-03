const { nullAddress } = require('../helper/tokenMapping');
const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./abi.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const REPL_HELPER_CONTRACT = '0x65846aECBF23385F76B73ef1EDD1ebdFf7Ac258D';

const PATH_TOKEN_CONTRACT = '0xc537e67Eb192b3F0B6B183ff52060Ee92475f398';
const ATH_TOKEN_CONTRACT_ARBITRUM = '0xc87b37a581ec3257b734886d9d3a581f5a9d056c';

const PFLT_TOKEN_CONTRACT = '0xa1cF424EE59d9B5C5B7F6801FE510E430cA1AEA8';

const PSWAN_TOKEN_CONTRACT = '0x00313eAC7eDC05412749bd65422B0Cb1fd4632E1';

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
  arbitrum: {
    tvl: async (api) => {
      const totalSupply = await api.call({ abi: abi.totalSupply, target: PATH_TOKEN_CONTRACT })
      api.add(ATH_TOKEN_CONTRACT_ARBITRUM, totalSupply)
    }
  },
  fluence: {
    tvl: async (api) => {
      const totalSupply = await api.call({ abi: abi.totalSupply, target: PFLT_TOKEN_CONTRACT })
      api.addGasToken(totalSupply)
      return sumTokens2({ api })
    }
  },
  swan: {
    tvl: async (api) => {
      const totalSupply = await api.call({ abi: abi.totalSupply, target: PSWAN_TOKEN_CONTRACT })
      api.addGasToken(totalSupply)
      return sumTokens2({ api })
    }
  }
};

