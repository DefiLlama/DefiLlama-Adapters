const abi = {
  automationBotV1: {
    TriggerAdded:
      "event TriggerAdded(uint256 indexed triggerId, address indexed commandAddress, uint256 indexed cdpId, bytes triggerData)",
    TriggerRemoved:
      "event TriggerRemoved(uint256 indexed cdpId, uint256 indexed triggerId)",
  },
  maker: {
    getOwner:
      "function getOwner ( uint256 _cdpId ) external view returns ( address )",
    getVaultInfo:
      "function getCdpInfo(uint256 vaultId,bytes32) view returns (uint256 collateralLocked, uint256)",
    ilks: "function ilks(uint256) view returns (bytes32)",
    info: "function info(bytes32 ilk) view returns (string name, string symbol, uint256 class, uint256 dec, address gem, address pip, address join, address xlip)",
  },
  automationBotV2: {
    TriggerAdded:
      "event TriggerAdded(uint256 indexed triggerId, address indexed commandAddress, bool continuous, uint256 triggerType, bytes triggerData)",
    TriggerRemoved: "event TriggerRemoved(uint256 indexed triggerId)",
  },
  aaveLike: {
    // aave/spark
    getUserReserveData:
      "function getUserReserveData ( address asset, address user ) external view returns ( uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled )",
  },
  morpho: {
    MorphoBluePosition:
      "function position ( bytes32, address ) external view returns ( uint256 supplyShares, uint128 borrowShares, uint128 collateral )",
  },
};

const logsTopic = {
  automationBotV1: {
    TriggerAdded:
      "0xcb616360dd177f28577e33576c8ac7ffcc1008cba7ac2323e0b2f170faf60bd2",
    TriggerRemoved:
      "0xb4a1fc324bd863f8cd42582bebf2ce7f2d309c6a84bf371f28e069f95a4fa9e1",
  },
  automationBotV2: {
    TriggerAdded:
      "0x1b5e88d5103127ddf4ea702813b5961c204a11865735302ab58bc7708198037e",
    TriggerRemoved:
      "0x89103ac4e3656b0071f9ed259dd79d305afcee547f3105f30587f094300c3bc2",
  },
};

const creationBlocks = {
  ethereum: {
    AutomationV1Contract: 14583413,
    AutomationV2Contract: 17229847,
  },
  base: {
    AutomationV2Contract: 9654043,
  },
  arbitrum: {
    AutomationV2Contract: 176672891,
  },
  optimism: {
    AutomationV2Contract: 115593245,
  },
};

const contracts = {
  ethereum: {
    // maker
    AutomationV1Contract: "0x6E87a7A0A03E51A741075fDf4D1FCce39a4Df01b",
    McdMonitorV2: "0xa59d5E94BFE605A9a4aC7e02f5380e02061c8dd2",
    CdpManager: "0x5ef30b9986345249bc32d8928b7ee64de9435e39",
    IlkRegistry: "0x5a464c28d19848f44199d003bef5ecc87d090f87",
    // automation
    AutomationBotV2: "0x5743b5606e94fb534a31e1cefb3242c8a9422e5e",
    // protocols
    AaveProtocolDataProvider: "0x497a1994c46d4f6C864904A9f1fac6328Cb7C8a6",
    SparkProtocolDataProvider: "0xFc21d6d146E6086B8359705C8b28512a983db0cb",
    MorphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
  },
  base: {
    AaveProtocolDataProvider: "0xC4Fcf9893072d61Cc2899C0054877Cb752587981",
    AutomationBotV2: "0x96D494b4544Bb7c3CB687ef7a9886Ed469e01ed8",
    MorphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
  },
  arbitrum: {
    AaveProtocolDataProvider: "0x14496b405D62c24F91f04Cda1c69Dc526D56fDE5",
    AutomationBotV2: "0xE018AeA83728a037D8B6f76cCA0E8331cDAb937a",
  },
  optimism: {
    AaveProtocolDataProvider: "0x14496b405D62c24F91f04Cda1c69Dc526D56fDE5",
    AutomationBotV2: "0xb2e2a088d9705cd412CE6BF94e765743Ec26b1e4",
  },
};

const aaveTriggerTypes = [
  111n,
  112n,
  121n,
  122n,
  133n,
  127n,
  128n,
  10006n,
  123n,
  124n,
];
const sparkTriggerTypes = [
  131n,
  132n,
  134n,
  129n,
  130n,
  10007n,
  125n,
  126n,
  117n,
  118n,
];
const morphoTriggerTypes = [139n, 140n, 141n, 142n, 10009n];

module.exports = {
  abi,
  logsTopic,
  creationBlocks,
  contracts,
  aaveTriggerTypes,
  sparkTriggerTypes,
  morphoTriggerTypes,
};
