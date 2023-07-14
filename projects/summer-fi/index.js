const { getLogs } = require("../helper/cache/getLogs");
const sdk = require("@defillama/sdk");

module.exports = {
  ethereum: {
    tvl,
  },
};

const contracts = {
  AutomationV1Contract: "0x6E87a7A0A03E51A741075fDf4D1FCce39a4Df01b",
  McdView: "0x6FBef01dd5B8e85b19733AB2A8e243FA3870623B",
  CdpManager: "0x5ef30b9986345249bc32d8928b7ee64de9435e39",
  IlkRegistry: "0x5a464c28d19848f44199d003bef5ecc87d090f87",
};

const logsTopic = {
  TriggerAdded:
    "0xcb616360dd177f28577e33576c8ac7ffcc1008cba7ac2323e0b2f170faf60bd2",
  TriggerExecuted:
    "0xc10f224f2f1ceab5e36f97effaa05c4b75eccbecd77b65bfb20c484de9096cdd",
  TriggerRemoved:
    "0xb4a1fc324bd863f8cd42582bebf2ce7f2d309c6a84bf371f28e069f95a4fa9e1",
};

const creationBlocks = {
  AutomationV1Contract: 14583413,
};

const getCdpData = async (cdpIds, api) =>
  api.multiCall({
    abi: abi.getVaultInfo,
    target: contracts.McdView,
    calls: cdpIds,
  });

const getCdpManagerData = async (cdpIds, api) =>
  api.multiCall({
    abi: abi.ilks,
    target: contracts.CdpManager,
    calls: cdpIds,
  });

const getIlkRegistryData = async (ilks, api) =>
  api.multiCall({
    abi: abi.info,
    target: contracts.IlkRegistry,
    calls: ilks,
  });

async function tvl(
  timestamp,
  _block,
  { ethereum: ethereumBlockHeight }, // not used, but included for clarity
  { api }
) {
  const cdpIdList = new Set();
  const executionStart = Date.now() / 1000;

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
  const cdpIds = [30444];
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

  console.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}

const abi = {
  TriggerAdded:
    "event TriggerAdded(uint256 indexed triggerId, address indexed commandAddress, uint256 indexed cdpId, bytes triggerData)",
  TriggerExecuted:
    "event TriggerExecuted(uint256 indexed triggerId, uint256 indexed cdpId, bytes executionData)",
  TriggerRemoved:
    "event TriggerRemoved(uint256 indexed cdpId, uint256 indexed triggerId)",
  activeTriggers:
    "function activeTriggers(uint256) view returns (bytes32 triggerHash, uint256 cdpId)",
  self: "address:self",
  serviceRegistry: "address:serviceRegistry",
  triggersCounter: "uint256:triggersCounter",
  getVaultInfo:
    "function getVaultInfo(uint256 vaultId) view returns (uint256 collateralLocked, uint256)",
  ilks: "function ilks(uint256) view returns (bytes32)",
  info: "function info(bytes32 ilk) view returns (string name, string symbol, uint256 class, uint256 dec, address gem, address pip, address join, address xlip)",
};
