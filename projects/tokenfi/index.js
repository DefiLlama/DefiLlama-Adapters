const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xb8D2471E35eE033Db509e0456c8eFc4135f4EE43"
const flokiToken = "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E"
const ethFlokiToken = "0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E"

async function ethtvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [ethFlokiToken], owner: contract, api })
}

async function bsctvl(time, ethBlock, _b, {api}) {
    return sumTokens2({ tokens: [flokiToken], owner: contract, api })
  }
// The TVL is the TVL. You count things like Liquid staking and lending pools in the normal TVL as well, which means that this number should NOT be under staking, but under normal TVL.
module.exports = {
  methodology: `We count the FLOKI on ${contract}`,
  ethereum: {
    tvl:  ethtvl
  },
  bsc: {
    tvl: bsctvl
  }
}
