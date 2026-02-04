const abi = {
    "poolInfo": "function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardBlock, uint256 accNATIVEPerShare, address strat)",
    "poolLength": "uint256:poolLength",
    "wantLockedTotal": "uint256:wantLockedTotal",
    "symbol": "string:symbol"
  };

const masterChefContract = "0x4fff737de45da4886f711b2d683fb6A6cf62C60C";

const ftmTvl = async (api) => {
  const poolData = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: masterChefContract})

  const strats = poolData.map(i => i.strat)
  const want = poolData.map(i => i.want)
  const bals = await api.multiCall({  abi: abi.wantLockedTotal, calls:strats })
  api.add(want, bals)
};

module.exports = {
  fantom: {
    tvl: ftmTvl,
  },
  methodology:
    "We count liquidity on all the Vaults through MasterChef Contract",
};
