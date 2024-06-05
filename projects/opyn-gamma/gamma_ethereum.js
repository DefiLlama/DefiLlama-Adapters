const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const START_BLOCK = 11551118;
const whitelist = "0xa5ea18ac6865f315ff5dd9f1a7fb1d41a30a6779";
const marginPool = "0x5934807cc0654d46755ebd2848840b616256c6ef";

function toAddress(str, skip = 0) {
  return `0x${str.slice(64 - 40 + 2 + skip * 64, 64 + 2 + skip * 64)}`.toLowerCase();
}

module.exports = async function ethereumTvl(api) {  
  let balances = {};

  if(!api.block || api.block >= START_BLOCK) {
    const whitelistedCollaterals = await getLogs({
      target: whitelist,
      topic: 'CollateralWhitelisted(address)',
      api,
      fromBlock: 11544457,
    })
  
    const tokens = whitelistedCollaterals.map(log => toAddress(log.topics[1]))
    return sumTokens2({ tokens, owner: marginPool, api, })
  }

  return balances;
}