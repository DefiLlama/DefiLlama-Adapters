const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')

async function KavaTvl(_time, _ethBlock, { kava: block }) {
  const contracts = {
    "trading": "0xa62a9c5cC8B92E00AB269BcA9f5539617AA65863",
    "kavapool": "0xa62a9c5cC8B92E00AB269BcA9f5539617AA65863",
  };
  const chain = 'kava'
  const tokens = [nullAddress]
  const owners = Object.values(contracts)
  return sumTokens2({ chain, block, tokens, owners, })
};

module.exports = {
  methodology: "Assets staked in the pool and trading contracts",
  kava: {
    tvl: KavaTvl
  },
};
