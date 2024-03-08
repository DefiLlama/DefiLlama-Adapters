const { sumTokens2 } = require("../helper/unwrapLPs");

const MUTO_FARM = "0x30b0e706fB7a6BfaFcdcd0C8290d8542b5E9C5a0";
const MUTO_MULTI_FARM = "0xBD08D27ED845a0b75e87A756226E6a2Bc1cDc4dA";
const NATIVE_TOKEN = "0x029d924928888697d3F3d169018d9d98d9f0d6B4".toLowerCase();
const TOKEN_LP = "0x417ed45c1adf3a3eb21fba7a40a4e2e4c3405050";

async function getTvl(api, farmAddress) {
  let pools = await api.call({ abi: abiInfo.poolTvls, target: farmAddress });

  pools
    .filter((i) => i.assets.toLowerCase() !== NATIVE_TOKEN)
    .forEach((i) => {
      api.add(i.assets, i.tvl);
    });

  return await sumTokens2({ api, resolveLP: true });
}

async function tvl(_, _1, _2, { api }) {
  await getTvl(api, MUTO_FARM);
  return await getTvl(api, MUTO_MULTI_FARM);
}

async function staking(_, _1, _2, { api }) {
  let pools = await api.call({ abi: abiInfo.poolTvls, target: MUTO_FARM });
  let target = pools.find((i) => i.assets.toLowerCase() === NATIVE_TOKEN);

  let { sqrtPriceX96 } = await api.call({
    abi: abiInfo.slot0,
    target: TOKEN_LP,
  });
  let ratio = (sqrtPriceX96 / 2 ** 96) ** 2;
  let usdc = "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9";
  let u = target.tvl * ratio;
  api.add(usdc, u);
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
  slot0:
    "function slot0() external view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)",
};
