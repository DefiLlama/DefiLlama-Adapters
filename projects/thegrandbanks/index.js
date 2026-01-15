const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { sumTokens2, } = require("../helper/unwrapLPs");

const GRAND = {
  bsc: "0xeE814F5B2bF700D2e843Dc56835D28d095161dd9",
  polygon: "0x14af08eccF4E305a332E1B7E146EbEC98A9637F0",
};

const GRANDBANKS_CONTRACT = {
  bsc: "0x3d8fd880976a3EA0f53cad02463867013D331107",
  polygon: "0xcF8070d9fbE3F96f4bFF0F90Cc84BfD30869dAF2",
  moonriver: "0xC6da8165f6f5F0F890c363cD67af1c33Bb540123",
};

async function tvl(api) {
  let masterchef = GRANDBANKS_CONTRACT[api.chain];

  const infos = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: masterchef })
  const strats = infos.map(i => i.strat)
  const tokens = infos.map(i => i.want)
  const bals = await api.multiCall({ abi: abi.wantLockedTotal, calls: strats })
  api.add(tokens, bals)
  const blacklistedTokens = ['0x9116F04092828390799514Bac9986529d70c3791', '0x124166103814E5a033869c88e0F40c61700Fca17', '0x7Edcdc8cD062948CE9A9bc38c477E6aa244dD545', '0xAA5509Ce0ecEA324bff504A46Fc61EB75Cb68B0c']
  if (GRAND[api.chain]) {
    blacklistedTokens.push(GRAND[api.chain])
  }
  blacklistedTokens.forEach(token => api.removeTokenBalance(token))
  return sumTokens2({ api, resolveLP: true, })
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: staking(GRANDBANKS_CONTRACT.bsc, GRAND.bsc),
    tvl,
  },
  polygon: {
    staking: staking(GRANDBANKS_CONTRACT.polygon, GRAND.polygon),
    tvl,
  },
  moonriver: {
    tvl,
  },
  methodology:
    "TVL counts the LP tokens that have been deposited to the protocol. The LP tokens are unwrapped and the balances are summed per token.",
};
