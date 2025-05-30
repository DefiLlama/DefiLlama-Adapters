const ADDRESSES = require('../helper/coreAssets.json')

const USDN_PROTOCOL_ADDRESS = "0x656cB8C6d154Aad29d8771384089be5B5141f01a";
const WSTETH_TOKEN_ADDRESS = ADDRESSES.ethereum.WSTETH;
const REBALANCER_ADDRESS = "0xaebcc85a5594e687f6b302405e6e92d616826e03";

async function fetchUSDNData(api) {

  const balanceVault = await api.call({ target: USDN_PROTOCOL_ADDRESS, abi: "uint256:getBalanceVault", });
  const balanceLong = await api.call({ target: USDN_PROTOCOL_ADDRESS, abi: "uint256:getBalanceLong", });
  const rebalancerCurrentStateData = await api.call({
    target: REBALANCER_ADDRESS,
    abi: "function getCurrentStateData() view returns (uint128 pendingAssets_, uint256 maxLeverage_, (int24 tick, uint256 tickVersion, uint256 index) currentPosId_)",
  });

  return {
    getBalanceVault: balanceVault,
    getBalanceLong: balanceLong,
    rebalancerPendingAssets: rebalancerCurrentStateData.pendingAssets_,
  };
}

const getEthereumTVL = async (api, block, chainBlocks) => {
  const usdnData = await fetchUSDNData(api);

  api.add(WSTETH_TOKEN_ADDRESS, Object.values(usdnData))
  return api.getBalances();
};

module.exports["ethereum"] = {
  timetravel: true,
  tvl: getEthereumTVL
};
