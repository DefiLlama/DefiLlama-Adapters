const { sumTokens2, sumTokensExport, } = require('../helper/unwrapLPs')
const Helper = require("./Helper.js");
const { farms: { MasterChefAddress, LockStakingAddress }, abi, token: { XWIN }  } = require('./Helper.js');

async function tvl(_, _1, _2, { api }) {
  const vaults = [
    ...Object.values(Helper.Strategies),
    ...Object.values(Helper.PublicVault),
    ...Object.values(Helper.PrivateVault),
  ]
  const bals = await api.multiCall({  abi: 'uint256:getVaultValues', calls: vaults})
  const tokens = await api.multiCall({  abi: 'address:baseToken', calls: vaults})
  api.addTokens(tokens, bals)
}

async function pool2(_, _1, _2, { api }) {
  const data = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfoMaster, target: MasterChefAddress, })
  return sumTokens2({ api, owner: MasterChefAddress, tokens: data.map(i => i[0]), resolveLP: true, blacklistedTokens: [XWIN, LockStakingAddress] })
}

module.exports = {
  bsc: {
    tvl,
    pool2,
    staking: sumTokensExport({ owners: [MasterChefAddress, LockStakingAddress], tokens: [XWIN]})
  },
};
