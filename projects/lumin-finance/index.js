const { nullAddress } = require("../helper/tokenMapping");
const { staking } = require('../helper/staking')

const LUMIN_V1_CONTRACT_ASSET_MANAGER = "0x61c6b185fafd2727ddeac6247e6770f5eadd823a"
const LUMIN_V2_CONTRACT = "0x1F00009c0310A4804925695F44355dE5110EC074"

const abi = {
  v1: {
    assetIds: "function getRegisteredAssetIDs() view returns (bytes4[] memory)",
    asset: "function getAsset(bytes4) view returns ((address, uint8, uint8, uint8, uint256) memory)",
    depositOf: "function depositOf(bytes4, address) view returns (uint128, uint128)"
  },
  v2: {
    stakeStats: "function getStakeStats() view returns ((uint64, uint72, uint24, uint24, uint24, uint24, uint24) memory, (uint64, uint72, uint24, uint24, uint24, uint24, uint24) memory)",
  }
}

async function tvl(api) {
  const assetIds = await api.call({ abi: abi.v1.assetIds, target: LUMIN_V1_CONTRACT_ASSET_MANAGER });
  const assetData = await api.multiCall({ abi: abi.v1.asset, calls: assetIds, target: LUMIN_V1_CONTRACT_ASSET_MANAGER })
  const tokens = assetData.map(asset => asset[0])
  return api.sumTokens({ tokens, owner: LUMIN_V1_CONTRACT_ASSET_MANAGER })
}

async function borrowed(api) {
  const assetIds = await api.call({ abi: abi.v1.assetIds, target: LUMIN_V1_CONTRACT_ASSET_MANAGER });
  const assetData = await api.multiCall({ abi: abi.v1.asset, calls: assetIds, target: LUMIN_V1_CONTRACT_ASSET_MANAGER })
  const tokens = assetData.map(asset => asset[0])
  const deposit = await api.multiCall({ abi: abi.v1.depositOf, target: LUMIN_V1_CONTRACT_ASSET_MANAGER, calls: assetIds.map(i => ({ params: [i, nullAddress] })) });
  tokens.forEach((token, i) => api.add(token, deposit[i][1]))
}

module.exports = {
  methodology: 'Gets v1 total deposits, and v2 staking statistics on-chain.',
  start: 194344665,
  arbitrum: {
    staking: staking('0x1F5FAB72ED3Be2F1cf8F4E20BC9096C94a04D5c5', '0x1FC01117E196800f416A577350CB1938d10501C2'),
    tvl, borrowed,
  }
}