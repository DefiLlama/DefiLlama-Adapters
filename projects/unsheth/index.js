const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require('../helper/cache/getLogs')

// upgraded LSDVault V2
const LSDVAULT_CONTRACT_V1 = "0xE76Ffee8722c21b390eebe71b67D95602f58237F";
const LSDVAULT_CONTRACT_V2 = "0x51A80238B5738725128d3a3e06Ab41c1d4C05C74";

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: LSDVAULT_CONTRACT_V2,
    topics: ['0xe5b3d6de4d7a3162af7ca9115e3e57964a3c605b53efa503cfcba6dd9ceb9e3c'],
    eventAbi: 'event LSDAdded(address lsd)',
    onlyArgs: true,
    fromBlock: 16951456,
  })
  const lsdAddresses = logs.map(i => i.lsd)
  const lsds_v1= await api.fetchList({  lengthAbi: 'uint256:tabs', itemAbi: 'function supportedLSDs(uint256) returns (address)', target: LSDVAULT_CONTRACT_V1}) 
  return sumTokens2({ api, ownerTokens: [[lsdAddresses, LSDVAULT_CONTRACT_V2], [lsds_v1, LSDVAULT_CONTRACT_V1]]});
}

module.exports = {
  ethereum: {
    tvl,
  },
}; // node test.js projects/unsheth/index.js
