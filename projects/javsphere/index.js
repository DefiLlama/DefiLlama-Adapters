const { staking } = require("../helper/staking.js");
const {stakings} = require("../helper/staking");
const ethers = require("ethers");
const BigNumber = require("bignumber.js");

const STAKING_BASE = '0xE420BBb4C2454f305a3335BBdCE069326985fb5b'
const FREEZER_BASE = '0x03e225D2bd32F5ecE539005B57F9B94A743ADBFB'
const VESTING_BASE = '0x42a40321843220e9811A1385D74d9798436f7002'
const JAV_BASE = '0xEdC68c4c54228D273ed50Fc450E253F685a2c6b9'
const abiStaking = [{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "poolInfo",
  "outputs": [
    {
      "internalType": "contract IERC20",
      "name": "baseToken",
      "type": "address"
    },
    {
      "internalType": "contract IERC20",
      "name": "rewardToken",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "totalShares",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "lastRewardBlock",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "accRewardPerShare",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "rewardsAmount",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "rewardsPerShare",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "minStakeAmount",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}]
const abiFreezer = [{
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "poolInfo",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "baseToken",
        "type": "address"
      },
      {
        "internalType": "contract IERC20",
        "name": "rewardToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "totalShares",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastRewardBlock",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "accRewardPerShare",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
}]

const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
const contractStaking = new ethers.Contract(STAKING_BASE, abiStaking, provider);
const contractFreezer = new ethers.Contract(FREEZER_BASE, abiFreezer, provider);

async function tvl(api) {
  const [stakingTvl, freezerTvl] = await Promise.all([
    contractStaking.poolInfo(0),
    contractFreezer.poolInfo(0)
  ]);
  const javTVL = new BigNumber(stakingTvl.totalShares).toNumber() / 1e18 + new BigNumber(freezerTvl.totalShares).toNumber() / 1e18;
  api.addCGToken('javsphere', javTVL)
}

module.exports = {
  methodology: `We count the total value locked from staking and freezer of javsphers native token JAV). `,
  hallmarks: [
    [1733837635, "Migration to BASE"],
  ],
  base: {
    tvl,
    staking: stakings( [STAKING_BASE, FREEZER_BASE],
        JAV_BASE),
    vesting: staking(VESTING_BASE,JAV_BASE)
  },
}
