const VAULT_ADDR = "0x66D586eae9B30CD730155Cb7fb361e79D372eA2a"
const { sumUnknownTokens } = require('../helper/unknownTokens')
const abi = require("./abi.json")

const vaultLocked = async (api) => {
  const poolInfos = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: VAULT_ADDR })
  let wanLockedTotals = await api.multiCall({ abi: abi.wantLockedTotal, calls: poolInfos.map(i => i.strategy), })
  const wants =  poolInfos.map(i => i.want)
  api.addTokens(wants, wanLockedTotals)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true,})
};
module.exports = {
  vaultLocked,
};
