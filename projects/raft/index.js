const ADDRESSES = require("../helper/coreAssets.json");

const RAFT_POSITION_MANAGER = "0x5f59b322eb3e16a0c78846195af1f588b77403fc";
const INTEREST_RATE_POSITION_MANAGER_ADDRESS = '0x9AB6b21cDF116f611110b048987E58894786C244';
const RAFT_PSM = "0xa03342feb2e1d4690b60ef556509ec3b76c97ee7";
const WRAPPED_RETH = "0xb69e35fb4a157028b92f42655090b984609ae598";
const CHAI = "0x06af07097c9eeb7fd685c692751d5c66db49c215";

async function tvl(_, ethBlock, _1, { api }) {
  const wstEthBalanceV1 = await api.call({ target: ADDRESSES.ethereum.WSTETH, params: RAFT_POSITION_MANAGER, abi: "erc20:balanceOf", });
  const rEthBalanceV1 = await api.call({ target: WRAPPED_RETH, abi: "erc20:balanceOf", params: RAFT_POSITION_MANAGER, });
  const interestRateWstEthBalance = await api.call({
    target: ADDRESSES.ethereum.WSTETH,
    params: INTEREST_RATE_POSITION_MANAGER_ADDRESS,
    abi: "erc20:balanceOf",
  });
  const interestRateREthBalance = await api.call({
    target: ADDRESSES.ethereum.RETH,
    params: INTEREST_RATE_POSITION_MANAGER_ADDRESS,
    abi: "erc20:balanceOf",
  });
  const interestRateWethBalance = await api.call({
    target: ADDRESSES.ethereum.WETH,
    params: INTEREST_RATE_POSITION_MANAGER_ADDRESS,
    abi: "erc20:balanceOf",
  });
  const interestRateSwEthBalance = await api.call({
    target: ADDRESSES.ethereum.swETH,
    params: INTEREST_RATE_POSITION_MANAGER_ADDRESS,
    abi: "erc20:balanceOf",
  });
  const interestRateCbEthBalance = await api.call({
    target: ADDRESSES.ethereum.cbETH,
    params: INTEREST_RATE_POSITION_MANAGER_ADDRESS,
    abi: "erc20:balanceOf",
  });

  const chaiBalance = await api.call({ target: CHAI, abi: "erc20:balanceOf", params: RAFT_PSM, });
  const potAddress = await api.call({ target: CHAI, abi: "address:pot", });
  const chaiRate = await api.call({ target: potAddress, abi: "uint256:chi", });
  const daiBalance = chaiBalance * chaiRate / 1e27;

  const wstEthBalance = BigInt(wstEthBalanceV1) + BigInt(interestRateWstEthBalance);
  const rEthBalance = BigInt(rEthBalanceV1) + BigInt(interestRateREthBalance);

  return {
    [ADDRESSES.ethereum.WSTETH]: wstEthBalance.toString(),
    [ADDRESSES.ethereum.RETH]: rEthBalance.toString(),
    [ADDRESSES.ethereum.WETH]: interestRateWethBalance,
    [ADDRESSES.ethereum.swETH]: interestRateSwEthBalance,
    [ADDRESSES.ethereum.cbETH]: interestRateCbEthBalance,
    [ADDRESSES.ethereum.DAI]: daiBalance,
  };
}

module.exports = {
  ethereum: {
    tvl,
  },
};
