const { sumTokens2 } = require("../helper/unwrapLPs");

const MUTO_FARM = "0x30b0e706fB7a6BfaFcdcd0C8290d8542b5E9C5a0";
const MUTO_MULTI_FARM = "0xBD08D27ED845a0b75e87A756226E6a2Bc1cDc4dA";
const MUTO_MULTI_FARM2 = "0x8f04DE4bE0521F768e8aeB4b5b9c63466B16f1ae";
const MUTO_MULTI_FARM3 = "0x79281F1796e8fcb899C412Aef5AFA37557b6936A";
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

async function tvl(api) {
  const MUTO_V3_FARM = "0xD7372abc6693702fF09536ec3824780eB264b2eF";
  const MUTO_V3_FARM2 = "0xCd356c40A86c59955e20FcCF7Bb3b9Be15AF238D";
  await sumTokens2({
    api,
    uniV3nftsAndOwners: [
      ["0x5752F085206AB87d8a5EF6166779658ADD455774", MUTO_V3_FARM],
    ],
  });
  await sumTokens2({
    api,
    uniV3nftsAndOwners: [
      ["0x218bf598D1453383e2F4AA7b14fFB9BfB102D637", MUTO_V3_FARM2],
    ],
  });
  await getTvl(api, MUTO_FARM);
  await getTvl(api, MUTO_MULTI_FARM2);
  await getTvl(api, MUTO_MULTI_FARM3);
  return await getTvl(api, MUTO_MULTI_FARM);
}

async function staking(api) {
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
};
