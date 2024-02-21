const {
  getCdpData,
  getCdpManagerData,
  getIlkRegistryData,
  getDecimalsData,
} = require("../helpers");

const automationTvl = async ({ api, cdpIdList }) => {
  let positionsWithTriggersAndCollateral = 0;

  const cdpIds = [...cdpIdList];
  const ilkNames = await getCdpManagerData(cdpIds, api);
  const cdpIlkIds = {}
  ilkNames.forEach((val, idx) => cdpIlkIds[cdpIds[idx]] = val)
  const ilkIds = [...new Set(ilkNames)];
  const tokens = (await getIlkRegistryData(ilkIds, api)).map((i) => i[4]);
  const decimals = await getDecimalsData(tokens, api);
  const collData = await getCdpData(cdpIds.map(i => [i, cdpIlkIds[i]]), api);
  collData.forEach(({ collateralLocked }, i) => {
    if (collateralLocked > 0) {
      positionsWithTriggersAndCollateral++;
    }
    const idx = ilkIds.indexOf(ilkNames[i]);
    api.add(tokens[idx], collateralLocked / 10 ** (18 - decimals[idx]));
  });
};

module.exports = {
  automationTvl,
};
