const mantlePoolABI = {
  inputs: [],
  name: "state",
  outputs: [
    {
      internalType: "uint160",
      name: "sqrtPrice_96",
      type: "uint160",
    },
    {
      internalType: "int24",
      name: "currentPoint",
      type: "int24",
    },
    {
      internalType: "uint16",
      name: "observationCurrentIndex",
      type: "uint16",
    },
    {
      internalType: "uint16",
      name: "observationQueueLen",
      type: "uint16",
    },
    {
      internalType: "uint16",
      name: "observationNextQueueLen",
      type: "uint16",
    },
    {
      internalType: "bool",
      name: "locked",
      type: "bool",
    },
    {
      internalType: "uint128",
      name: "liquidity",
      type: "uint128",
    },
    {
      internalType: "uint128",
      name: "liquidityX",
      type: "uint128",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const mantleMiningABI = {
  inputs: [],
  name: "getMiningContractInfo",
  outputs: [
    {
      internalType: "address",
      name: "tokenX_",
      type: "address",
    },
    {
      internalType: "address",
      name: "tokenY_",
      type: "address",
    },
    {
      internalType: "uint24",
      name: "fee_",
      type: "uint24",
    },
    {
      components: [
        {
          internalType: "address",
          name: "rewardToken",
          type: "address",
        },
        {
          internalType: "address",
          name: "provider",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "accRewardPerShare",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "rewardPerSecond",
          type: "uint256",
        },
      ],
      internalType: "struct BaseTimestamp.RewardInfo[]",
      name: "rewardInfos_",
      type: "tuple[]",
    },
    {
      internalType: "address",
      name: "iziTokenAddr_",
      type: "address",
    },
    {
      internalType: "int24",
      name: "rewardUpperTick_",
      type: "int24",
    },
    {
      internalType: "int24",
      name: "rewardLowerTick_",
      type: "int24",
    },
    {
      internalType: "uint256",
      name: "lastTouchTime_",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "totalVLiquidity_",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "startTime_",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "endTime_",
      type: "uint256",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const mantleTotalNiZiABI = {
  inputs: [],
  name: "totalNIZI",
  outputs: [
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  stateMutability: "view",
  type: "function",
};

module.exports = {
  mantleMiningABI,
  mantlePoolABI,
  mantleTotalNiZiABI,
};
