const {
  getCdpData,
  getCdpManagerData,
  getIlkRegistryData,
  getDecimalsData,
} = require("../helpers");

const makerTvl = async ({ api, cdpIdList, confirmedSummerFiMakerVaults }) => {
  const confirmedSummerFiMakerVaultsArray = [
    ...Object.keys(confirmedSummerFiMakerVaults),
  ];
  const confirmedSummerFiMakerVaultsSet = new Set(
    confirmedSummerFiMakerVaultsArray
  );
  ([...cdpIdList]).forEach((cdpId) => {
    confirmedSummerFiMakerVaultsSet.delete(cdpId);
  });

  const filteredVaultsList = [...confirmedSummerFiMakerVaultsSet].filter(
    (i) => {
      const [startBlock] = confirmedSummerFiMakerVaults[i];
      return api.block > startBlock;
    }
  );
  const cdpIds = [...new Set(filteredVaultsList)]
  const ilkNames = await getCdpManagerData(cdpIds, api);
  const cdpIlkIds = {}
  ilkNames.forEach((val, idx) => cdpIlkIds[cdpIds[idx]] = val)
  const ilkIds = [...new Set(ilkNames)];
  const tokens = (await getIlkRegistryData(ilkIds, api)).map((i) => i[4]);
  const decimals = await getDecimalsData(tokens, api);
  const collData = await getCdpData(filteredVaultsList.map(i => [i, cdpIlkIds[i]]), api);
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
