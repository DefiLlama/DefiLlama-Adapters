
const POOLS = {
  base: [
    "0x0000eFC4ec03a7c47D3a38A9Be7Ff1d52dD01b99",
    "0xcB1c06554772BC855D81a6be648cC599710e1b99",
  ],
  monad: [
    "0x0000a8fd148694aE3E17c079Ce4BBF8187758888",
    "0xb1c8ead40da9b6afcb6f34b15e10123505c38888",
  ],
  bsc: [
    "0x00007904d186680C709519e71f4Dc3e2Df8f1b99",
    "0x0B1ce37bc7eE857916B4e2dF9F69775c36831B99",
  ],
};

async function tvl(api) {
  const pools = POOLS[api.chain];
  const tokenXs = await api.multiCall({ abi: 'address:X', calls: pools });
  const tokenYs = await api.multiCall({ abi: 'address:Y', calls: pools });
  const ownerTokens = pools.map((pool, i) => [[tokenXs[i], tokenYs[i]].filter(Boolean), pool]).filter(([tokens]) => tokens.length);
  return api.sumTokens({ ownerTokens });
}

module.exports = {
  methodology:
    "TVL is the total value of tokens held across LunarBase PMM pool contracts.",
  ...Object.keys(POOLS).reduce((acc, chain) => {
    acc[chain] = { tvl };
    return acc;
  }, {}),
}

