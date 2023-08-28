const { getBalance } = require("../helper/utils");
const { sumTokens } = require("../helper/unwrapLPs")
const contracts = require("./contracts.json");
const sdk = require("@defillama/sdk");

function chainTvl(chain) {
  const exports = {
    tvl: async (timestamp, _, { [chain]: block }) => {
      const toa = []
      const holders = Object.values(contracts[chain].contracts)
      const tokens = Object.values(contracts[chain].tokens)
      holders.forEach(o => tokens.forEach(t => toa.push([t, o])))
      return sumTokens({}, toa, block, chain)
    },
  }
  if (chain === 'ethereum')
    exports.staking = async (_, block) => {
      return sumTokens({}, [
        ["0xbc19712feb3a26080ebf6f2f7849b417fdd792ca", "0x204c87CDA5DAAC87b2Fc562bFb5371a0B066229C"],
      ], block)
    }
  return exports
}

const chainTVLObject = Object.keys(contracts)
  .reduce((agg, chain) => ({ ...agg, [chain]: chainTvl(chain) }), {});

module.exports = {
  ...chainTVLObject,
  timetravel: false,
  bitcoin: {
    tvl: async () => {
      return {
        bitcoin: await getBalance('bitcoin', '33ZibwpiZe4bM5pwpAdQNqqs2RthLkpJer')
      }
    }
  },
  litecoin: {
    tvl: async (_, block) => {
      return {
        litecoin: (await sdk.api.erc20.totalSupply({ target: '0x07C44B5Ac257C2255AA0933112c3b75A6BFf3Cb1', block })).output / 1e18
      }
    }
  },
  doge: {
    tvl: async (_, block) => {
      return {
        dogecoin: (await sdk.api.erc20.totalSupply({ target: '0x9c306A78b1a904e83115c05Ac67c1Ef07C653651', block })).output / 1e18
      }
    }
  }
};