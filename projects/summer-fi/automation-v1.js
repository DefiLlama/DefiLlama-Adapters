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

  triggerAddedEvents.forEach((event) => {
    cdpIdList.add(event.cdpId.toString());
  });
  console.log("Got", triggerAddedEvents.length, " triggers added");

  [...triggerRemovedEvents, ...triggerExecutedEvents].forEach((event) => {
    cdpIdList.delete(event.cdpId.toString());
  });

  console.log("Got", cdpIdList.size, "active triggers");
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
    const idx = ilkIds.indexOf(ilkNames[i]);
    api.add(tokens[idx], collateralLocked / 10 ** (18 - decimals[idx]));
  });
};

module.exports = {
  automationTvl,
};
