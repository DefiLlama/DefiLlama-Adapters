const {
  abi,
  contracts,
  aaveTriggerTypes,
  sparkTriggerTypes,
  morphoTriggerTypes,
  logsTopic,
  creationBlocks,
} = require("./constants");

const { getLogs } = require("../helper/cache/getLogs");
const { ethers } = require("ethers");
const { getDecimalsData } = require("./helpers");

const decoder = ethers.AbiCoder.defaultAbiCoder();

const getTriggerData = (trigger) => {
  const [_positionAddress, triggerType] = decoder.decode(
    [
      "address", // position address
      "uint16", // trigger type
    ],
    trigger.triggerData
  );

  const isMorpho = morphoTriggerTypes.includes(triggerType);
  const decoderFields = [
    "address", // position address
    "uint16", // trigger type
    "uint256", // maxCoverage (not used)
    "address", // debt token
    "address", // collateral token
    "bytes32", // operation name (not used)
  ];
  if (isMorpho) {
    decoderFields.push("bytes32"); // pool id (in morpho)
  }
  const [
    positionAddress, // position address (DPM)
    _triggerType, // trigger type (mapped above)
    _maxCoverage, // maxCoverage (not used)
    debtTokenAddress, // debt token
    collateralTokenAddress, // collateral token
    _operationName, // operation name (not used)
    poolId, // pool id (in morpho)
  ] = decoder.decode(decoderFields, trigger.triggerData);
  return {
    positionAddress,
    triggerType,
    debtTokenAddress,
    collateralTokenAddress,
    poolId,
  };
};

const getAaveLikePositionCollateralCall = ({
  positionAddress,
  collateralTokenAddress,
}) => {
  return {
    params: [collateralTokenAddress, positionAddress],
  };
};

const getMorphoPositionCollateralCall = ({
  positionAddress,
  poolId,
  collateralTokenAddress,
}) => {
  return {
    collateralTokenAddress,
    params: [poolId, positionAddress],
  };
};

const getAutomationV2Data = async ({ api }) => {
  const triggersMap = new Map();
  const [triggerAddedEvents, triggerRemovedEvents] = await Promise.all(
    Object.keys(logsTopic.automationBotV2).map((key) =>
      getLogs({
        api,
        fromBlock: creationBlocks[api.chain].AutomationV2Contract,
        target: contracts[api.chain].AutomationBotV2,
        eventAbi: abi.automationBotV2[key],
        extraKey: `${api.chain}-${key}V2`,
        onlyArgs: true,
      })
    )
  );
  const triggerEvents = [
    ...triggerAddedEvents.map((event) => ({
      triggerData: event.triggerData,
      triggerId: event.triggerId.toString(),
      action: "triggerAdded",
    })),
    ...triggerRemovedEvents.map((event) => ({
      triggerData: event.triggerData,
      triggerId: event.triggerId.toString(),
      action: "triggerRemoved",
    })),
  ].sort((a, b) => a.triggerId - b.triggerId);

  triggerEvents.forEach(({ triggerData, action, triggerId }) => {
    if (action === "triggerAdded") {
      triggersMap.set(triggerId, { triggerData, action, triggerId });
    } else if (action === "triggerRemoved") {
      triggersMap.delete(triggerId);
    }
  });

  const triggersData = Array.from(triggersMap.values(), getTriggerData);
  const finalTriggersData = new Map(); // Use a Map to ensure uniqueness
  triggersData.forEach((trigger) => {
    const { positionAddress, triggerType } = trigger;
    const protocolName = (() => {
      if (aaveTriggerTypes.includes(triggerType)) return "Aave";
      if (sparkTriggerTypes.includes(triggerType)) return "Spark";
      if (morphoTriggerTypes.includes(triggerType)) return "Morpho";
      return false;
    })();
    if (!protocolName) return;
    const key = `${api.chain}-${positionAddress}-${protocolName}`;

    if (!finalTriggersData.has(key)) {
      finalTriggersData.set(key, trigger);
    }
  });
  return Array.from(finalTriggersData.values());
};

const automationV2Tvl = async ({ api, automationV2Data }) => {
  const aaveCalls = [];
  const sparkCalls = [];
  const morphoCalls = [];
  const tokens = new Set();
  automationV2Data.forEach(
    ({ positionAddress, triggerType, collateralTokenAddress, poolId }) => {
      if (aaveTriggerTypes.includes(triggerType)) {
        aaveCalls.push(
          getAaveLikePositionCollateralCall({
            positionAddress,
            collateralTokenAddress,
          })
        );
        if (!tokens.has(collateralTokenAddress)) {
          tokens.add(collateralTokenAddress);
        }
      }
      if (sparkTriggerTypes.includes(triggerType)) {
        sparkCalls.push(
          getAaveLikePositionCollateralCall({
            positionAddress,
            collateralTokenAddress,
          })
        );
        if (!tokens.has(collateralTokenAddress)) {
          tokens.add(collateralTokenAddress);
        }
      }
      if (morphoTriggerTypes.includes(triggerType)) {
        morphoCalls.push(
          getMorphoPositionCollateralCall({
            positionAddress,
            poolId,
            collateralTokenAddress,
          })
        );
        if (!tokens.has(collateralTokenAddress)) {
          tokens.add(collateralTokenAddress);
        }
      }
    }
  );

  const [
    aaveCollateralData,
    sparkCollateralData,
    morphoCollateralData,
    decimals,
  ] = await Promise.all([
    api.multiCall({
      abi: abi.aaveLike.getUserReserveData,
      target: contracts[api.chain].AaveProtocolDataProvider,
      calls: aaveCalls,
    }),
    api.multiCall({
      abi: abi.aaveLike.getUserReserveData,
      target: contracts[api.chain].SparkProtocolDataProvider,
      calls: sparkCalls,
    }),
    api.multiCall({
      abi: abi.morpho.MorphoBluePosition,
      target: contracts[api.chain].MorphoBlue,
      calls: morphoCalls.map((call) => ({
        // re-mapped because im saving the collateral token in morphoCalls for later
        params: [call.params[0], call.params[1]],
      })),
    }),
    getDecimalsData(tokens, api),
  ]);

  aaveCollateralData.forEach((aaveData, aaveDataIndex) => {
    const collateralAmount = aaveData[0]; // currentATokenBalance
    if (collateralAmount > 0) {
      const collateralTokenAddress = aaveCalls[aaveDataIndex].params[0];
      api.add(
        collateralTokenAddress,
        collateralAmount / 10 ** (18 - decimals[collateralTokenAddress])
      );
    }
  });
  sparkCollateralData.forEach((sparkData, sparkDataIndex) => {
    const collateralAmount = sparkData[0]; // currentATokenBalance
    if (collateralAmount > 0) {
      const collateralTokenAddress = sparkCalls[sparkDataIndex].params[0];
      api.add(
        collateralTokenAddress,
        collateralAmount / 10 ** (18 - decimals[collateralTokenAddress])
      );
    }
  });

  morphoCollateralData.forEach((morphoData, morphoDataIndex) => {
    const collateralAmount = morphoData[2]; // collateral
    if (collateralAmount > 0) {
      const collateralTokenAddress =
        morphoCalls[morphoDataIndex].collateralTokenAddress; // saved in morphoCalls
      api.add(
        collateralTokenAddress,
        collateralAmount / 10 ** (18 - decimals[collateralTokenAddress])
      );
    }
  });
};

module.exports = {
  getAutomationV2Data,
  automationV2Tvl,
};
