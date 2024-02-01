let abis = {};

abis.cover = {
  getProtocolDetails: "function getProtocolDetails() view returns (bytes32 _name, bool _active, uint256 _claimNonce, uint256 _claimRedeemDelay, uint256 _noclaimRedeemDelay, address[] _collaterals, uint48[] _expirationTimestamps, address[] _allCovers, address[] _allActiveCovers)",
}

abis.protocols = {
  getAllProtocolAddresses: "address[]:getAllProtocolAddresses",
}

module.exports = {
  abis
}

