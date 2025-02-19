const { nullAddress } = require('../helper/tokenMapping');
const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./abi.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const REPL_HELPER_CONTRACT = '0x65846aECBF23385F76B73ef1EDD1ebdFf7Ac258D';

const ATH_HELPER_CONTRACT = '0x2032F104069CC3023C0A0b6874F8A5fB21A5E511';
const ATH_TOKEN_CONTRACT_ARBITRUM = '0xc87b37a581ec3257b734886d9d3a581f5a9d056c';

const FLT_HELPER_CONTRACT = '0x1880cDDAa54a2f33628D22a3548427886818Aaa5';

const SWAN_HELPER_CONTRACT = '0x12B7859BF6FaA171361393CF71dd7c0F5171855A';

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
      const totalSupply = await api.call({ abi: abi.getTvlTokenAmount, target: ATH_HELPER_CONTRACT })
      api.add(ATH_TOKEN_CONTRACT_ARBITRUM, totalSupply)
    }
  },
  fluence: {
    tvl: async (api) => {
      const totalSupply = await api.call({ abi: abi.getTvlTokenAmount, target: FLT_HELPER_CONTRACT })
      api.addGasToken(totalSupply)
      return sumTokens2({ api })
    }
  },
  swan: {
    tvl: async (api) => {
      const totalSupply = await api.call({ abi: abi.getTvlTokenAmount, target: SWAN_HELPER_CONTRACT })
      api.addGasToken(totalSupply)
      return sumTokens2({ api })
    }
  }
};

