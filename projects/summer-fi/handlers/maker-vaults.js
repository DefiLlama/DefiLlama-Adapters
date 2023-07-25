const {
  getCdpData,
  getCdpManagerData,
  getIlkRegistryData,
} = require("../helpers");

const makerTvl = async ({ api, cdpIdList, confirmedSummerFiMakerVaults }) => {
  const confirmedSummerFiMakerVaultsArray = [
    ...Object.keys(confirmedSummerFiMakerVaults),
  ];
  const confirmedSummerFiMakerVaultsSet = new Set(
    confirmedSummerFiMakerVaultsArray
  );
  cdpIdList.forEach((cdpId) => {
    confirmedSummerFiMakerVaultsSet.delete(cdpId);
  });
  const filteredVaultsList = [...confirmedSummerFiMakerVaultsSet].filter(
    (i) => api.block >= confirmedSummerFiMakerVaults[i]
  );
  const ilkNames = await getCdpManagerData(
    [...new Set(filteredVaultsList)],
    api
  );
  const ilkIds = [...new Set(ilkNames)];
  const tokens = (await getIlkRegistryData(ilkIds, api)).map((i) => i.gem);
  const decimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: tokens,
  });
  const collData = await getCdpData(filteredVaultsList, api);
  collData.forEach(({ collateralLocked }, i) => {
    const idx = ilkIds.indexOf(ilkNames[i]);
    if (idx === -1) {
      return;
    }
    api.add(tokens[idx], collateralLocked / 10 ** (18 - decimals[idx]));
  });
};

module.exports = {
  makerTvl,
};
