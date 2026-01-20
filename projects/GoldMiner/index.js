const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x112ab27F55B30619AFc9Db89bEf89990627DeCd5"

async function tvl(time, ethBlock, { sonic: block }) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, block, chain: 'sonic', })
}

module.exports = {
  methodology: `We count the SONIC on ${contract}`,
  sonic: {
    tvl
  }
}
