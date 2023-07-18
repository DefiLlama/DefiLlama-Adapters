const { confirmedSummerFiMakerVaults } = require("../constants");
const {
  getCdpData,
  getCdpManagerData,
  getIlkRegistryData,
} = require("../helpers");

const makerTvl = async ({ api, cdpIdList }) => {
  const confirmedSummerFiMakerVaultsArray = [...confirmedSummerFiMakerVaults];
  cdpIdList.forEach((cdpId) => {
    confirmedSummerFiMakerVaults.delete(cdpId);
  });
  const ilkNames = await getCdpManagerData(
    confirmedSummerFiMakerVaultsArray,
    api
  );
  const ilkIds = [...new Set(ilkNames)];
  const tokens = (await getIlkRegistryData(ilkIds, api)).map((i) => i.gem);
  const decimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: tokens,
  });
  const collData = await getCdpData(confirmedSummerFiMakerVaultsArray, api);
  collData.forEach(({ collateralLocked }, i) => {
    const idx = ilkIds.indexOf(ilkNames[i]);
    api.add(tokens[idx], collateralLocked / 10 ** (18 - decimals[idx]));
  });
};

module.exports = {
  makerTvl,
};
