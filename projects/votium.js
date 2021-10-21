const sdk = require("@defillama/sdk")
const web3 = require('./config/web3.js')
const BigNumber = require("bignumber.js")



// IMPOR CONSTANTS.JS IS SIMPLER
const vlCVXAddress = "0xD18140b4B819b895A3dba5442F959fA44994AF50"
const cvxCRVAddress = "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7"
const liveProposalOngoing = true

// Best reference: https://votium.app/static/js/components/Header/Header.js
// Good reference: https://github.com/oo-00/Votium/blob/main/utils/allDelegations.js
async function getTotalLocked_supply(timestamp, block, chainBlocks) {
  // vlCVX locked
  vlCVXContract = new web3.eth.Contract(vlCVXABI, vlCVXAddress)
  let vlCVXLocked
  if (liveProposalOngoing) {
    //locked at current epoch (uncomment on live proposal):
    let epochCount = await vlCVXContract.methods.epochCount().call()
    vlCVXLocked = await vlCVXContract.methods.totalSupplyAtEpoch(epochCount - 1).call()
  } 
  else {
    //total supply locked (uncomment between proposals):
    vlCVXLocked = await vlCVXContract.methods.lockedSupply().call()
  }
  vlCVXLocked = new BigNumber(vlCVXLocked).div(10 ** 18)
  vlCVXLocked = Number(vlCVXLocked).toFixed(2)
  console.log('vlCVXLocked', vlCVXLocked)

  // veCRV locked 
  cvxCRVContract = new web3.eth.Contract(cvxCRVABI, cvxCRVAddress)
  let veCRVLocked = await cvxCRVContract.methods.totalSupply().call()
  veCRVLocked = new BigNumber(veCRVLocked).div(10 ** 18).toPrecision()
  veCRVLocked = Number(veCRVLocked).toFixed(2)
  console.log('veCRVLocked', veCRVLocked)

  return {
    'vlCVXLocked': vlCVXLocked, 
    'veCRVLocked': veCRVLocked
  }
}

async function getTotalLocked_underlying(timestamp, block, chainBlocks) {
  // CVX and cvxCRV locked in contract https://etherscan.io/address/0xD18140b4B819b895A3dba5442F959fA44994AF50
  let cvxLocked = await sdk.api.erc20.balanceOf({
    target: '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b',
    owner: '0xD18140b4B819b895A3dba5442F959fA44994AF50',
    block: chainBlocks['ethereum'],
    chain: 'ethereum'
  })
  let cvxCRVLocked = await sdk.api.erc20.balanceOf({
    target: '0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7',
    owner: '0xD18140b4B819b895A3dba5442F959fA44994AF50',
    block: chainBlocks['ethereum'],
    chain: 'ethereum'
  })
  return {
    '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b': cvxLocked.output, 
    '0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7': cvxCRVLocked.output
  }
}

async function tvl(timestamp, block, chainBlocks) {
  balances = await getTotalLocked_underlying(timestamp, block, chainBlocks)
  return balances
}

const vlCVXABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_kicked",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_reward",
        type: "uint256",
      },
    ],
    name: "KickReward",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "Recovered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_reward",
        type: "uint256",
      },
    ],
    name: "RewardAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_rewardsToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_reward",
        type: "uint256",
      },
    ],
    name: "RewardPaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_paidAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_lockedAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_boostedAmount",
        type: "uint256",
      },
    ],
    name: "Staked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      { indexed: false, internalType: "bool", name: "_relocked", type: "bool" },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "_rewardsToken", type: "address" },
      { internalType: "address", name: "_distributor", type: "address" },
      { internalType: "bool", name: "_useBoost", type: "bool" },
    ],
    name: "addReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_rewardsToken", type: "address" },
      { internalType: "address", name: "_distributor", type: "address" },
      { internalType: "bool", name: "_approved", type: "bool" },
    ],
    name: "approveRewardDistributor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_epoch", type: "uint256" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "balanceAtEpochOf",
    outputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balances",
    outputs: [
      { internalType: "uint112", name: "locked", type: "uint112" },
      { internalType: "uint112", name: "boosted", type: "uint112" },
      { internalType: "uint32", name: "nextUnlockIndex", type: "uint32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "boostPayment",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "boostRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "boostedSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "checkpointEpoch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_account", type: "address" }],
    name: "claimableRewards",
    outputs: [
      {
        components: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct CvxLocker.EarnedData[]",
        name: "userRewards",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "cvxCrv",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "cvxcrvStaking",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "denominator",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "epochCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "epochs",
    outputs: [
      { internalType: "uint224", name: "supply", type: "uint224" },
      { internalType: "uint32", name: "date", type: "uint32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_time", type: "uint256" }],
    name: "findEpochId",
    outputs: [{ internalType: "uint256", name: "epoch", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_account", type: "address" },
      { internalType: "bool", name: "_stake", type: "bool" },
    ],
    name: "getReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_account", type: "address" }],
    name: "getReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_rewardsToken", type: "address" },
    ],
    name: "getRewardForDuration",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isShutdown",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_account", type: "address" }],
    name: "kickExpiredLocks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "kickRewardEpochDelay",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "kickRewardPerEpoch",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_rewardsToken", type: "address" },
    ],
    name: "lastTimeRewardApplicable",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_account", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "uint256", name: "_spendRatio", type: "uint256" },
    ],
    name: "lock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "lockDuration",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "lockedBalanceOf",
    outputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "lockedBalances",
    outputs: [
      { internalType: "uint256", name: "total", type: "uint256" },
      { internalType: "uint256", name: "unlockable", type: "uint256" },
      { internalType: "uint256", name: "locked", type: "uint256" },
      {
        components: [
          { internalType: "uint112", name: "amount", type: "uint112" },
          { internalType: "uint112", name: "boosted", type: "uint112" },
          { internalType: "uint32", name: "unlockTime", type: "uint32" },
        ],
        internalType: "struct CvxLocker.LockedBalance[]",
        name: "lockData",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lockedSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maximumBoostPayment",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maximumStake",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minimumStake",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextBoostRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextMaximumBoostPayment",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_rewardsToken", type: "address" },
      { internalType: "uint256", name: "_reward", type: "uint256" },
    ],
    name: "notifyRewardAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "_relock", type: "bool" }],
    name: "processExpiredLocks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bool", name: "_relock", type: "bool" },
      { internalType: "uint256", name: "_spendRatio", type: "uint256" },
      { internalType: "address", name: "_withdrawTo", type: "address" },
    ],
    name: "processExpiredLocks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_tokenAddress", type: "address" },
      { internalType: "uint256", name: "_tokenAmount", type: "uint256" },
    ],
    name: "recoverERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "rewardData",
    outputs: [
      { internalType: "bool", name: "useBoost", type: "bool" },
      { internalType: "uint40", name: "periodFinish", type: "uint40" },
      { internalType: "uint208", name: "rewardRate", type: "uint208" },
      { internalType: "uint40", name: "lastUpdateTime", type: "uint40" },
      {
        internalType: "uint208",
        name: "rewardPerTokenStored",
        type: "uint208",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "rewardDistributors",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_rewardsToken", type: "address" },
    ],
    name: "rewardPerToken",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "rewardTokens",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "rewardWeightOf",
    outputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "rewards",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardsDuration",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "setApprovals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_max", type: "uint256" },
      { internalType: "uint256", name: "_rate", type: "uint256" },
      { internalType: "address", name: "_receivingAddress", type: "address" },
    ],
    name: "setBoost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_rate", type: "uint256" },
      { internalType: "uint256", name: "_delay", type: "uint256" },
    ],
    name: "setKickIncentive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_minimum", type: "uint256" },
      { internalType: "uint256", name: "_maximum", type: "uint256" },
    ],
    name: "setStakeLimits",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_staking", type: "address" }],
    name: "setStakingContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "shutdown",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stakeOffsetOnLock",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stakingProxy",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stakingToken",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "supply", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_epoch", type: "uint256" }],
    name: "totalSupplyAtEpoch",
    outputs: [{ internalType: "uint256", name: "supply", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "userLocks",
    outputs: [
      { internalType: "uint112", name: "amount", type: "uint112" },
      { internalType: "uint112", name: "boosted", type: "uint112" },
      { internalType: "uint32", name: "unlockTime", type: "uint32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "userRewardPerTokenPaid",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
]
const cvxCRVABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_from", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_to", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "operator",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_operator", type: "address" }],
    name: "setOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
]

module.exports = {
  tvl,   
  methodology: `Votium TVL is the sum of CVX and cvxCRV locked into the Votium contract`, 
}
