const KAIA_GPC = '0x27397bfbefd58a437f2636f80a8e70cfc363d4ff';
const AVALANCHE_GPC = '0x1b27D7A06DeEa4d5CB4fd60c164153C90f64281D';

async function kaiaGpcTotalSupply(api) {
  const supply = await api.call({ abi: 'erc20:totalSupply', target: KAIA_GPC })
  api.add(KAIA_GPC, supply)
}

async function avalancheTotalSupply(api) {
  const supply = await api.call({ abi: 'erc20:totalSupply', target: AVALANCHE_GPC })
  api.add(AVALANCHE_GPC, supply)
}

module.exports = {
  klaytn: {
    tvl:kaiaGpcTotalSupply,
  },
  avax: {
    tvl: avalancheTotalSupply,
  }
}

