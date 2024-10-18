const abi = require("../helper/abis/masterchef.json");
const { sumTokens2 } = require("../helper/unwrapLPs.js");
const { pool2 } = require('../helper/pool2')
const { staking } = require('../helper/staking')

const token = "0xd86Be84feC60Fedf263059BB1581e00d2168e19D";
const masterchef = "0x1610374513e989Fc263A5741A053fa023A6f212A";

const pool2LPs = [
  "0xeA3998615d2Bfe793E84318d5fE9D3Aa3d0F2F3f",
  "0x628C669511C4be30DA1c3C7Da4725eCD074c1c8B",
  "0x961C853477cAc8B9cfef953312331a2bE0C31C67",
  "0x7815A02bf54aa25039cC40Ac63daA84D876D130C"
]

async function tvl(api) {
  const poolInfos = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: masterchef })
  const tokens = poolInfos.map(pool => pool.lpToken)
  return sumTokens2({ api, owner: masterchef, tokens, blacklistedTokens: [...pool2LPs, token], resolveLP: true })
}

module.exports = {
  fantom: {
    tvl,
    pool2: pool2(masterchef, pool2LPs),
    staking: staking(masterchef, token)
  },
}