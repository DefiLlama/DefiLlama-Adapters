module.exports = {
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
    "function getCdpInfo(uint256 vaultId,bytes32) view returns (uint256 collateralLocked, uint256)",
  ilks: "function ilks(uint256) view returns (bytes32)",
  info: "function info(bytes32 ilk) view returns (string name, string symbol, uint256 class, uint256 dec, address gem, address pip, address join, address xlip)",
};
