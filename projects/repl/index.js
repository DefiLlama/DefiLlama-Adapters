const { nullAddress } = require('../helper/tokenMapping');
const { get } = require('../helper/http');
const abi = require('./abi.json');
const { json } = require('starknet');
const { ethers } = require('ethers');
const http = require('../helper/http');

const WFIL_WPFIL_POOL_ADDRESS = '0x443A6243A36Ef0ae1C46523d563c15abD787F4E9';
const PFIL_CONTRACT = '0xAaa93ac72bECfbBc9149f293466bbdAa4b5Ef68C';
const WPFIL_CONTRACT = '0x57E3BB9F790185Cfe70Cc2C15Ed5d6B84dCf4aDb';
const WFIL_CONTRACT = '0x60E1773636CF5E4A227d9AC24F20fEca034ee25A';
const REPL_HELPER_CONTRACT = '0x65846aECBF23385F76B73ef1EDD1ebdFf7Ac258D';

// Total Assets of Miners pledged to the protocol
const getMinerAssets = (agents) => {
  return agents.reduce((sum, agent) => sum + +agent.minerBalance, 0);
};

module.exports = {
  filecoin: {
    tvl: async (api) => {
      const [tvlComponents, activeAgents] = await Promise.all([
        api.call({ abi: abi.getTVLComponents, target: REPL_HELPER_CONTRACT }),
        api.call({ abi: abi.getAllActiveAgents, target: REPL_HELPER_CONTRACT }),
      ]);

      const minerAssets = getMinerAssets(activeAgents);
      api.add(nullAddress, minerAssets);
      api.add(nullAddress, tvlComponents);
    },
  },
};
