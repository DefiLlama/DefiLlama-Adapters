const { sumTokens2 } = require("../helper/unwrapLPs");
const { V3Utils } = require("./V3Utils");

const MUTO_FARM = "0x30b0e706fB7a6BfaFcdcd0C8290d8542b5E9C5a0";
const MUTO_MULTI_FARM = "0xBD08D27ED845a0b75e87A756226E6a2Bc1cDc4dA";
const MUTO_V3_FARM = "0xD7372abc6693702fF09536ec3824780eB264b2eF";
const NATIVE_TOKEN = "0x029d924928888697d3F3d169018d9d98d9f0d6B4".toLowerCase();

async function getTvl(api, farmAddress) {
  let pools = await api.call({ abi: abiInfo.poolTvls, target: farmAddress });

  pools
    .filter((i) => i.assets.toLowerCase() !== NATIVE_TOKEN)
    .forEach((i) => {
      api.add(i.assets, i.tvl);
    });

  return await sumTokens2({ api, resolveLP: true });
}

async function getV3Tvl(api, farmAddress) {
  let length = await api.call({
    abi: abiInfo.getPoolLength,
    target: farmAddress,
  });
  for (let index = 0; index < length; index++) {
    let nftIds = await api.call({
      abi: abiInfo.getV3PoolNfts,
      target: farmAddress,
      params: [index],
    });
    let { positionManager, poolVault, decimals0, decimals1, token0, token1 } =
      V3_INFO_MAP[farmAddress][index];

    let { sqrtPriceX96 } = await api.call({
      abi: abiInfo.slot0,
      target: poolVault,
    });

    for (const nftId of nftIds) {
      let info = await api.call({
        abi: abiInfo.positions,
        params: [nftId],
        target: positionManager,
      });
      let [amount0, amount1] = V3Utils.getTokenAmounts(
        info.liquidity.toString(),
        sqrtPriceX96.toString(),
        info.tickLower,
        info.tickUpper,
        decimals0,
        decimals1
      );
      api.add(token0, amount0);
      api.add(token1, amount1);
    }
  }
}

async function tvl(_, _1, _2, { api }) {
  await getTvl(api, MUTO_FARM);
  await getV3Tvl(api, MUTO_V3_FARM);
  return await getTvl(api, MUTO_MULTI_FARM);
}

async function staking(_, _1, _2, { api }) {
  let pools = await api.call({ abi: abiInfo.poolTvls, target: MUTO_FARM });
  let target = pools.find((i) => i.assets.toLowerCase() === NATIVE_TOKEN);
  api.add(NATIVE_TOKEN, target.tvl);

  return api.getBalances();
}

module.exports = {
  mantle: {
    tvl,
    staking,
  },
};

const abiInfo = {
  poolTvls:
    "function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])",
  getV3PoolNfts:
    "function getPoolLpTokens(uint256 _pid) public view returns (uint256[] memory)",
  getPoolLength: "function getPoolLength() public view returns (uint256)",
  positions:
    "function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
  slot0:
    "function slot0() external view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)",
};

const V3_INFO_MAP = {
  [MUTO_V3_FARM]: {
    0: {
      positionManager: "0x5752F085206AB87d8a5EF6166779658ADD455774",
      poolVault: "0x8A6A1ED01989Ff1c5ac6361c34cad9d7D0015AB4",
      token0: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0",
      decimals0: 18,
      token1: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111",
      decimals1: 18,
    },
    1: {
      positionManager: "0x5752F085206AB87d8a5EF6166779658ADD455774",
      poolVault: "0x16867D00D45347A2DeD25B8cdB7022b3171D4ae0",
      token0: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9",
      decimals0: 6,
      token1: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE",
      decimals1: 6,
    },
  },
};
