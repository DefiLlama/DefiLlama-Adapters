const { sliceIntoChunks } = require("@defillama/sdk/build/util/index.js");

const { abi, contracts, logsTopic, creationBlocks } = require("./constants");
const { cachedCalls } = require("./cache");

const { getLogs } = require("../helper/cache/getLogs");
const { getDecimalsData } = require("./helpers");

const getCdpData = async (cdpIds, api) => {
  const res = [];
  const chunks = sliceIntoChunks(cdpIds, 100);
  for (const chunk of chunks)
    res.push(
      ...(await api.multiCall({
        abi: abi.maker.getVaultInfo,
        target: contracts.ethereum.McdMonitorV2,
        calls: chunk.map((i) => ({ params: i })),
      }))
    );

  return res;
};

const getCdpManagerData = async (cdpIds, api) => {
  return cachedCalls({
    items: cdpIds,
    multiCall: async (calls) =>
      api.multiCall({
        abi: abi.maker.ilks,
        target: contracts.ethereum.CdpManager,
        calls,
      }),
    key: "getCdpManagerData",
  });
};

const getIlkRegistryData = async (ilks, api) => {
  return cachedCalls({
    items: ilks,
    multiCall: async (calls) =>
      api.multiCall({
        abi: abi.maker.info,
        target: contracts.ethereum.IlkRegistry,
        calls,
      }),
    key: "getIlkRegistryData",
  });
};

const getAutomationV1Data = async ({ api }) => {
  const cdpIdList = new Map();
  if (api.chain !== "ethereum") return cdpIdList;
  const [triggerAddedEvents, triggerRemovedEvents] = await Promise.all(
    Object.keys(logsTopic.automationBotV1).map((key) =>
      getLogs({
        api,
        fromBlock: creationBlocks.ethereum.AutomationV1Contract,
        target: contracts.ethereum.AutomationV1Contract,
        eventAbi: abi.automationBotV1[key],
        extraKey: `${api.chain}-${key}V1`,
        onlyArgs: true,
      })
    )
  );
  const triggerEvents = [
    ...triggerAddedEvents.map((event) => ({
      cdp: event.cdpId.toString(),
      trigger: event.triggerId.toString(),
      action: "triggerAdded",
    })),
    ...triggerRemovedEvents.map((event) => ({
      cdp: event.cdpId.toString(),
      trigger: event.triggerId.toString(),
      action: "triggerRemoved",
    })),
  ].sort((a, b) => a.trigger - b.trigger);

  triggerEvents.forEach(({ cdp, action }) => {
    if (action === "triggerAdded") {
      cdpIdList.set(cdp, cdp);
    } else if (action === "triggerRemoved") {
      cdpIdList.delete(cdp);
    }
  });

  return Array.from(cdpIdList.values());
};

const automationV1Tvl = async ({ api, automationV1Data }) => {
  const cdpIds = [...automationV1Data];
  if (cdpIds.length === 0) return;
  const ilkNames = await getCdpManagerData(cdpIds, api);
  const cdpIlkIds = {};
  ilkNames.forEach((val, idx) => (cdpIlkIds[cdpIds[idx]] = val));
  const ilkIds = [...new Set(ilkNames)];
  const tokens = (await getIlkRegistryData(ilkIds, api)).map((i) => i[4]);
  const decimals = await getDecimalsData(tokens, api);
  const collData = await getCdpData(
    cdpIds.map((i) => [i, cdpIlkIds[i]]),
    api
  );
  collData.forEach(({ collateralLocked }, i) => {
    const idx = ilkIds.indexOf(ilkNames[i]);
    api.add(tokens[idx], collateralLocked / 10 ** (18 - decimals[idx]));
  });
};

module.exports = {
  getAutomationV1Data,
  automationV1Tvl,
};
