const { nullAddress } = require("../helper/tokenMapping");

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

const lutSymbol = {
  ARB: 'arbitrum',
  USDC: 'usd-coin',
  USDT: 'tether'
}

async function staking({ api }) {
  const stakingBalance = await api.call({
    abi: abi.v2.stakeStats,
    target: LUMIN_V2_CONTRACT,
    params: [],
  });

  return {
    'LUMIN': (BigInt(stakingBalance[0][0]) + BigInt(stakingBalance[1][0])) / BigInt(10 ** 12)
  }
}

async function tvl({ api }) {
  const assetIds = await api.call({
    abi: abi.v1.assetIds,
    target: LUMIN_V1_CONTRACT_ASSET_MANAGER
  });

  const deposits = {}

  for (const assetId of assetIds) {
    const asset = await api.call({
      abi: abi.v1.asset,
      target: LUMIN_V1_CONTRACT_ASSET_MANAGER,
      params: [assetId],
    });

    const symbol = await api.call({
      abi: 'erc20:symbol',
      target: asset[0]
    })

    const deposit = await api.call({
      abi: abi.v1.depositOf,
      target: LUMIN_V1_CONTRACT_ASSET_MANAGER,
      params: [assetId, nullAddress],
    });

    deposits[lutSymbol[symbol] ?? symbol] = deposit[0] / (10 ** asset[3])
  }

  return deposits
}

module.exports = {
  timetravel: true,
  methodology: 'Gets v1 total deposits, and v2 staking statistics on-chain.',
  start: 194344665,
  arbitrum: {
    staking,
    tvl
  }
};
