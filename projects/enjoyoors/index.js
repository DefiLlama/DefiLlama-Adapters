const { sumTokens2 } = require("../helper/unwrapLPs");
const { get } = require('../helper/http')

async function tvl(api, vaultAddress, enjoyoorsChainId) {
  const { items } = await get(`https://api.enjoyoors.xyz/v1/tokens?chain=${enjoyoorsChainId}&offset=0&limit=10000`);
  const listedTokens = items.map(i => i.address);

  return sumTokens2({ api, owner: vaultAddress, tokens: listedTokens });
}

module.exports = {
  methodology: 'The TVL reflects the total value of all tokens deposited in the Enjoyoors vault contract.',
  ethereum: {
    tvl: async (api) => tvl(api, '0x59660cb83da31EC23F9d992C11f80Fc527046409', 1),
  },
  monad: {
    tvl: async (api) => tvl(api, '0x6B5E332387e8beC98C52F10A72952B17176B4f1b', 11),
  }
}; 