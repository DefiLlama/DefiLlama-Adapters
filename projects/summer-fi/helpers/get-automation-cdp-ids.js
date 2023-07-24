const { getLogs } = require("../../helper/cache/getLogs");

const { abi, contracts, logsTopic, creationBlocks } = require("../constants");

const getAutomationCdpIdList = async ({ api }) => {
  const cdpIdList = new Set();
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
  return cdpIdList;
};

module.exports = {
  getAutomationCdpIdList,
};
