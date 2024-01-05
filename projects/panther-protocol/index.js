const { staking } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs')


const contracts = {
  polygon: {
    core: '0x9A06Db14D639796B25A6ceC6A1bf614fd98815EC',
  },
  ethereum: {
    core: '0x909E34d3f6124C324ac83DccA84b74398a6fa173',
    staking: '0xf4d06d72dacdd8393fa4ea72fdcc10049711f899'
  }
};

const blacklistedTokens = [];

function getTVLFunc(contractAddress, chain) {
  return async function (timestamp, _, { [chain]: block }, { api }) {
    return sumTokens2({ owner: contractAddress, fetchCoValentTokens: true, blacklistedTokens, api })
  }
}

function getChainTVL(chain) {
  return {
    staking: contracts[chain].staking ? staking(contracts[chain].staking, contracts[chain].core) : undefined,
    tvl: getTVLFunc(contracts[chain].proxy, chain),
  };
}

Object.keys(contracts).forEach(chain => {
  module.exports[chain] = getChainTVL(chain)
}) 
