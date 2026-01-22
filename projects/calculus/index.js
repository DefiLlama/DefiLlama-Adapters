const { getLogs2 } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const CALCULUS_CONTRACT = "0xb5e6AdA1466840096FcEDCC409528a9cB763f650";
const START_BLOCK = 66651811;
const abi = {
  "BalancerUpdated": "event BalancerUpdated(address who, bool isRemoved)",
  "GasInjected": "event GasInjected(uint64 indexed operationNonce, uint32 vaultId, uint256 amount, uint256 available)",
  "Initialized": "event Initialized(uint64 version)",
  "NewUser": "event NewUser(address who, address lpMananger)",
  "OwnershipTransferred": "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "Upgraded": "event Upgraded(address indexed implementation)",
  "VaultClosed": "event VaultClosed(uint64 indexed operationNonce, uint32 vaultId, (uint256 amount0, uint256 amount1) tokenAmount, address operator)",
  "VaultCreated": "event VaultCreated(uint64 indexed operationNonce, uint16 tokenPairId, uint32 vaultId, uint256 reserve0, uint256 reserve1, address operator, (uint16 strategyId, bytes metadata) strategy)",
  "VaultPositionClosed": "event VaultPositionClosed(uint64 indexed operationNonce, address liquidityOwner, uint32 vaultId, (uint256 amount0, uint256 amount1) tokenAmount, (uint256 amount0, uint256 amount1) feeEarned, address operator)",
  "VaultPositionCollectedFee": "event VaultPositionCollectedFee(uint64 indexed operationNonce, uint32 vaultId, uint256 amount0, uint256 amount1, address operator)",
  "VaultPositionDecreased": "event VaultPositionDecreased(uint64 indexed operationNonce, uint32 vaultId, uint128 liquidity, uint256 amount0, uint256 amount1, address operator)",
  "VaultPositionIncreased": "event VaultPositionIncreased(uint64 indexed operationNonce, uint32 vaultId, uint128 liquidity, (uint256 amount0, uint256 amount1) reserves, (uint256 amount0, uint256 amount1) injected, address operator)",
  "VaultPositionOpened": "event VaultPositionOpened(uint64 indexed operationNonce, uint32 vaultId, uint128 liquidity, address liquidityOwner, int24 tickLower, uint160 sqrtOpen, int24 tickUpper, uint256 reserve0, uint256 reserve1, address operator)",
  "VaultStrategyUpdated": "event VaultStrategyUpdated(uint64 indexed operationNonce, uint32 vaultId, (uint16 strategyId, bytes metadata) strategy)",
  "UPGRADE_INTERFACE_VERSION": "string:UPGRADE_INTERFACE_VERSION",
  "closeVault": "function closeVault(uint32 _vaultId)",
  "collectFee": "function collectFee(uint32 _vaultId)",
  "config": "address:config",
  "decreaseLiquidity": "function decreaseLiquidity(uint32 _vaultId, uint256 _liquidityPercent)",
  "gas": "function gas(uint32) view returns (uint256)",
  "increaseLiquidity": "function increaseLiquidity(uint32 _vaultId, (bool zeroForOne, uint160 priceLimitSqrt, uint256 priceLimit) _quote, (uint256 amount0, uint256 amount1) _desiredAmounts) payable",
  "initialize": "function initialize(address _config, address _wrappedNativeToken, address[] _balancers)",
  "injectGas": "function injectGas(uint32 _vaultId) payable",
  "listActiveVaults": "uint32[]:listActiveVaults",
  "listBalancers": "address[]:listBalancers",
  "listVaults": "function listVaults(uint32[] _vaultIds) view returns (uint64, (uint16 tokenPairId, uint32 vaultId, address owner, (uint256 amount0, uint256 amount1) feeEarned, (uint256 amount0, uint256 amount1) reserves, (uint256 tokenId) position)[])",
  "openVault": "function openVault(uint16 _tokenPairId, int24 _tickLower, int24 _tickUpper, (uint256 amount0, uint256 amount1) _principle, (bool zeroForOne, uint160 priceLimitSqrt, uint256 priceLimit) _quote, (uint16 strategyId, bytes metadata) _strategy) payable",
  "operationNonce": "uint64:operationNonce",
  "owner": "address:owner",
  "proxiableUUID": "function proxiableUUID() view returns (bytes32)",
  "rebalance": "function rebalance((uint32 vaultId, (bool zeroForOne, uint160 priceLimitSqrt, uint256 priceLimit) quote, int24 tickLower, int24 tickUpper, bool compoundFee, uint256 previousRebalanceGas) _params)",
  "renounceOwnership": "function renounceOwnership()",
  "transferOwnership": "function transferOwnership(address newOwner)",
  "updateBalancer": "function updateBalancer(address _who, bool _isRemove)",
  "updateConfig": "function updateConfig(address _config)",
  "updateVaultStrategy": "function updateVaultStrategy(uint32 _vaultId, (uint16 strategyId, bytes metadata) _strategy)",
  "upgradeToAndCall": "function upgradeToAndCall(address newImplementation, bytes data) payable",
  "userGasUsage": "function userGasUsage(address) view returns (uint256)",
  "userToOperator": "function userToOperator(address) view returns (address)",
  "vaultStrategies": "function vaultStrategies(uint32) view returns (uint16 strategyId, bytes metadata)",
  "wrappedNativeToken": "address:wrappedNativeToken"
}

module.exports = {
  methodology:
    "Tvl is tokens in the calculus lp manager contracts (pcs v3 positions created by calculus users)",
  bsc: { tvl },
};


async function tvl(api) {
  const logs = await getLogs2({ api, target: CALCULUS_CONTRACT, fromBlock: START_BLOCK, eventAbi: abi.NewUser })
  const vaultOwners = logs.map(i => i.lpMananger);
  await sumTokens2({ api, owners: vaultOwners, resolveUniV3: true, })
  const tokens = Object.keys(api.getBalances()).filter(i => i.startsWith('bsc:')).map(i => i.split(':')[1])
  return api.sumTokens({ tokens, owner: CALCULUS_CONTRACT})
}