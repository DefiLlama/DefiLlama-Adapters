exports.abi = {
  getSdtStakings: `function getSdtStakings(uint256 _cursorStart, uint256 _lengthDesired) view returns (tuple(address stakingContract, string stakingName)[])`,
  getGlobalViewCvgSdtStaking:
    "function getGlobalViewCvgSdtStaking(address _stakingContract) view returns (tuple(address cvgSdt, address stakingAddress, uint256 cvgCycle, uint256 previousTotal, uint256 actualTotal, uint256 nextTotal) globalViewCvgSdtStaking)",
  staking_token: "function staking_token() view returns (address)",
  token: "function token() view returns (address)",
};
