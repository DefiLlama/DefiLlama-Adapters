const {
  getCdpData,
  getCdpManagerData,
  getIlkRegistryData,
} = require("../helpers");

const confirmedSummerFiMakerVaults = new Set(
  [
    30780, 30749, 30722, 30746, 30731, 30726, 30676, 30778, 30714, 30704, 30738,
    30711, 30675, 30701, 30753, 30782, 30763,
    // this list needs to be updated with the latest/biggest confirmed vaults
  ].map((id) => id.toString())
);

const makerTvl = async ({ api, cdpIdList }) => {
  cdpIdList.forEach((cdpId) => {
    confirmedSummerFiMakerVaults.delete(cdpId);
  });
  const ilkNames = await getCdpManagerData(
    [...confirmedSummerFiMakerVaults],
    api
  );
  const ilkIds = [...new Set(ilkNames)];
  const tokens = (await getIlkRegistryData(ilkIds, api)).map((i) => i.gem);
  const decimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: tokens,
  });
  const collData = await getCdpData([...confirmedSummerFiMakerVaults], api);
  collData.forEach(({ collateralLocked }, i) => {
    const idx = ilkIds.indexOf(ilkNames[i]);
    api.add(tokens[idx], collateralLocked / 10 ** (18 - decimals[idx]));
  });
};

module.exports = {
  makerTvl,
};
