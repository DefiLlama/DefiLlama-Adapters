const { getLogs } = require("../helper/cache/getLogs");

const abi = require("./abi.js");
const contracts = require("./contracts.js");
const calls = require("./calls.js");
const logsTopic = require("./logs-topic.js");
const constants = require("./constants.js");

const { creationBlocks } = constants;
const { getCdpData, getCdpManagerData, getIlkRegistryData } = calls;

const automationTvl = async ({ api }) => {
  const cdpIdList = new Set();
  let positionsWithTriggersAndCollateral = 0;

  const [triggerAddedEvents, triggerRemovedEvents, triggerExecutedEvents] =
    await Promise.all(
      Object.keys(logsTopic).map((key) =>
        getLogs({
          api,
          fromBlock: creationBlocks.AutomationV1Contract,
          target: contracts.AutomationV1Contract,
          topics: [logsTopic[key]],
          eventAbi: abi[key],
          extraKey: key,
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
    ...triggerExecutedEvents.map((event) => ({
      cdp: event.cdpId.toString(),
      trigger: event.triggerId.toString(),
      action: "triggerExecuted",
    })),
  ].sort((a, b) => a.trigger - b.trigger);

  triggerEvents.forEach((event) => {
    const { cdp, action } = event;
    if (action === "triggerAdded") {
      cdpIdList.add(cdp);
    } else if (action === "triggerRemoved" || action === "triggerExecuted") {
      cdpIdList.delete(cdp);
    }
  });

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
  console.log(
    JSON.stringify(
      {
        triggersAdded: triggerAddedEvents.length,
        triggersRemovedandExecuted:
          triggerRemovedEvents.length + triggerExecutedEvents.length,
        triggersActive: cdpIdList.size,
        positionsWithTriggersAndCollateral,
      },
      null,
      2
    )
  );
};

module.exports = {
  automationTvl,
};
