const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");

const RAFT_POSITION_MANAGER = "0x5f59b322eb3e16a0c78846195af1f588b77403fc";
const RAFT_PSM = "0xa03342feb2e1d4690b60ef556509ec3b76c97ee7";
const WRAPPED_RETH = "0xb69e35fb4a157028b92f42655090b984609ae598";
const CHAI = "0x06af07097c9eeb7fd685c692751d5c66db49c215";

async function tvl(_, ethBlock) {
  const wstEthBalance = await sdk.api.abi.call({
    block: ethBlock,
    target: ADDRESSES.ethereum.WSTETH,
    params: RAFT_POSITION_MANAGER,
    abi: "erc20:balanceOf",
  });

  const rEthBalance = await sdk.api.abi.call({
    block: ethBlock,
    target: WRAPPED_RETH,
    abi: "erc20:balanceOf",
    params: RAFT_POSITION_MANAGER,
  });

  const chaiBalance = await sdk.api.abi.call({
    block: ethBlock,
    target: CHAI,
    abi: "erc20:balanceOf",
    params: RAFT_PSM,
  });

  const potAddress = await sdk.api.abi.call({
    block: ethBlock,
    target: CHAI,
    abi: "address:pot",
  });

  const chaiRate = await sdk.api.abi.call({
    block: ethBlock,
    target: potAddress.output,
    abi: "uint256:chi",
  });

  const daiBalance =
    (BigInt(chaiBalance.output) * BigInt(chaiRate.output)) / 10n ** 27n;

  return {
    [ADDRESSES.ethereum.WSTETH]: wstEthBalance.output,
    [ADDRESSES.ethereum.RETH]: rEthBalance.output,
    [ADDRESSES.ethereum.DAI]: daiBalance.toString(),
  };
}

module.exports = {
  ethereum: {
    tvl,
  },
};
