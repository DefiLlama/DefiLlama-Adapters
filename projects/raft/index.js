const ADDRESSES = require("../helper/coreAssets.json");

const RAFT_POSITION_MANAGER = "0x5f59b322eb3e16a0c78846195af1f588b77403fc";
const RAFT_PSM = "0xa03342feb2e1d4690b60ef556509ec3b76c97ee7";
const WRAPPED_RETH = "0xb69e35fb4a157028b92f42655090b984609ae598";
const CHAI = "0x06af07097c9eeb7fd685c692751d5c66db49c215";

async function tvl(_, ethBlock, _1, { api }) {
  const wstEthBalance = await api.call({ target: ADDRESSES.ethereum.WSTETH, params: RAFT_POSITION_MANAGER, abi: "erc20:balanceOf", });
  const rEthBalance = await api.call({ target: WRAPPED_RETH, abi: "erc20:balanceOf", params: RAFT_POSITION_MANAGER, });

  const chaiBalance = await api.call({ target: CHAI, abi: "erc20:balanceOf", params: RAFT_PSM, });
  const potAddress = await api.call({ target: CHAI, abi: "address:pot", });
  const chaiRate = await api.call({ target: potAddress, abi: "uint256:chi", });
  const daiBalance = chaiBalance * chaiRate / 1e27;

  return {
    [ADDRESSES.ethereum.WSTETH]: wstEthBalance,
    [ADDRESSES.ethereum.RETH]: rEthBalance,
    [ADDRESSES.ethereum.DAI]: daiBalance,
  };
}

module.exports = {
  ethereum: {
    tvl,
  },
};
