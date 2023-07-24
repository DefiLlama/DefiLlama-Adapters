const {
  getCdpData,
  getCdpManagerData,
  getIlkRegistryData,
} = require("../helpers");

const automationTvl = async ({ api, cdpIdList }) => {
  let positionsWithTriggersAndCollateral = 0;

  const cdpIds = [...cdpIdList];
  const ilkNames = await getCdpManagerData(cdpIds, api);
  const ilkIds = [...new Set(ilkNames)];
  const tokens = (await getIlkRegistryData(ilkIds, api)).map((i) => i.gem);
  const decimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: tokens,
  });
  const collData = await getCdpData(cdpIds, api);
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
