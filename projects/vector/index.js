const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs, unwrapLPsAuto } = require("../helper/unwrapLPs");
const { pool2 } = require("../helper/pool2");
const { staking, stakings } = require("../helper/staking.js");
const abi =
  "function getDepositTokensForShares(uint256 amount, address token) view returns (uint256)";
const contracts = require("./contracts.json");
const vectorContracts = require("./vectorContracts.json");
////Platypus info
const platypusPoolsInfo = vectorContracts.PTP.pools;
const PtpMainStakingAddress = vectorContracts.PTP.main_staking.address;
const MasterPlatypusAddress = vectorContracts.PTP.master_platypus.address;
///Joe Info
const JoeMainStakingAddress = vectorContracts.JOE.main_staking.address;
const JoePoolsInfo = vectorContracts.JOE.pools;
///Vector Info
const masterchefAddress = vectorContracts.PROTOCOL.masterchief.address;
const OldLockerAddress = vectorContracts.PTP.old_locker.address;
const LockerAddress = vectorContracts.PTP.locker.address;
const VectorPoolsInfo = vectorContracts.PROTOCOL.pools;
const VectorStakingPools = [
  VectorPoolsInfo.VTX,
  VectorPoolsInfo.XPTP,
  VectorPoolsInfo.ZJOE,
];
const VectorLPPools = [
  VectorPoolsInfo.AVAX_VTX,
  VectorPoolsInfo.PTP_XPTP,
  VectorPoolsInfo.JOE_ZJOE,
];
async function tvl(timestamp, block, chainBlocks, { api }) {
  const balances = {};
  const transform = (addr) => "avax:" + addr;
  //GET PLATYPUS BALANCES
  const platypusPIDs = (
    await api.multiCall({
      calls: Object.values(platypusPoolsInfo).map((pool) => ({
        target: MasterPlatypusAddress,
        params: [pool.lp],
      })),
      abi: "function getPoolId(address) view returns (uint256)",
    })
  );
  //console.log("platypusPIDS:", platypusPIDs);
  const platypusBalancesOutputs = (
    await api.multiCall({
      calls: platypusPIDs.map((pool) => ({
        target: MasterPlatypusAddress,
        params: [pool, PtpMainStakingAddress],
      })),
      abi: "function userInfo(uint256,address) view returns (uint256,uint256,uint256,uint256)",
    })
  );
  //console.log("platypusBalancesOutputs:", platypusBalancesOutputs);
  const platypusBalances = Object.values(platypusPoolsInfo).map((pool, i) => ({
    balance: platypusBalancesOutputs[i][0],
    token: pool.token.address,
    isLP: false,
  }));
  //console.log("platypusBalances:", platypusBalances);
  //GET JOE BALANCES
  const joeBalancesOutputs = (
    await api.multiCall({
      calls: Object.values(JoePoolsInfo).map((pool) => ({
        target: masterchefAddress,
        params: [pool.receipt.address],
      })),
      abi: "function getPoolInfo(address) view returns (uint256,uint256,uint256,uint256)",
    })
  );
  //console.log("joeBalancesOutputs:", joeBalancesOutputs);
  const joeBalances = Object.values(JoePoolsInfo).map((pool, i) => ({
    balance: joeBalancesOutputs[i][2], //balance
    token: pool.token.address, //underlying lp token
    isLP: true,
  }));
  //console.log("joeBalances:", joeBalances);
  //GET VECTOR CORE BALANCES
  const masterChefBalancesOutput = (
    await api.multiCall({
      calls: [...VectorStakingPools, ...VectorLPPools].map((pool) => ({
        target: pool.token.address,
        params: [masterchefAddress],
      })),
      abi: "erc20:balanceOf",
    })
  );
  //console.log("masterChefBalancesOutput:", masterChefBalancesOutput);
  const masterChefBalances = [...VectorStakingPools, ...VectorLPPools].map(
    (pool, i) => ({
      balance: masterChefBalancesOutput[i],
      token: pool.token.address,
      isLP: pool.token.contract === "IJoePair",
    })
  );
  //console.log("masterChefBalances:", masterChefBalances);
  //GET OLD LOCKER BALANCES
  const oldLockerBalancesOutput = (
    await api.multiCall({
      calls: [
        {
          target: "0x601B89a43EBBE26FA48d91F43eD63D08831d17CD",
          params: [],
        },
      ],
      abi: "function totalSupply() view returns (uint256)",
    })
  );
  //console.log("oldLockerBalancesOutput:", oldLockerBalancesOutput);
  //GET NEW LOCKER BALANCES
  const newLockerBalancesOutput = (
    await api.multiCall({
      calls: [
        {
          target: LockerAddress,
          params: [],
        },
      ],
      abi: "function totalLocked() view returns (uint256)",
    })
  );
  //console.log("newLockerBalancesOutput:", newLockerBalancesOutput);
  const lockerBalances = [
    {
      balance: oldLockerBalancesOutput[0],
      token: vectorContracts.tokens.VTX.address,
      isLP: false,
    },
    {
      balance: newLockerBalancesOutput[0],
      token: vectorContracts.tokens.VTX.address,
      isLP: false,
    },
  ];
  //console.log("lockerBalances:", lockerBalances);
  const AllBalances = [
    ...platypusBalances,
    ...joeBalances,
    ...masterChefBalances,
    ...lockerBalances,
  ];

  for (let i = 0; i < AllBalances.length; i++) {
    const info = AllBalances[i];
    sdk.util.sumSingleBalance(balances, transform(info.token), info.balance);
  }
  return unwrapLPsAuto({ api, balances});
}

module.exports = {
  doublecounted: true,
  avax: {
    tvl,
    /* staking: stakings(
      [masterchefAddress, LockerAddress],
      [vectorContracts.tokens.VTX.address],
      "avax",
      "avax:0x5817D4F0b62A59b17f75207DA1848C2cE75e7AF4"
    ), */ //No More Staking of VTX
    pool2: staking(
      contracts.contracts.masterchef,
      contracts.contracts.pool2,
    ),
  },
};
// node test.js projects/vector/index.js
