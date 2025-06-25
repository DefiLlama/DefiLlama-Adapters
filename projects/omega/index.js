const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const CONTRACTS = [
  {
    asset: ADDRESSES.mantle.mETH,
    lendingPool: "0x68F108F6bDbe14b77f5d042b1b43bb36c60F8580",
    collateralManager: "0xb092b9543B2C18D0857C3e81fACAE8c0CC08e079",
  },
  {
    asset: ADDRESSES.mantle.cmETH,
    lendingPool: "0x0819EC86Bf7278547B6962392f49Fa0e88A04b7b",
    collateralManager: "0xd2698b234b23966258578e0539a5d5aAb8d49893",
  },
  {
    asset: ADDRESSES.mantle.WETH,
    lendingPool: "0x1B69264CA6E951B14db2Cf330dE2744524A22040",
    collateralManager: "0x911A9E6b1C1FA4A8CEc88153c4C841f579899308",
  },
  {
    asset: ADDRESSES.mantle.WMNT,
    lendingPool: "0xA49C0FA50768c4560feD129e90D3734a12711E8A",
    collateralManager: "0x5181F0Ed157CA00ab3D899e131D424d456884078",
  },
  {
    asset: ADDRESSES.mantle.USDT,
    lendingPool: "0x5dad97d4973B60870AAe284eF3EC6d74Bffc011D",
    collateralManager: "0x709a5B78980b17E7f7C20b59f5a3e4E744e4590f",
  },
  {
    asset: ADDRESSES.mantle.USDe,
    lendingPool: "0xa803861Ae852Cb34A4fD8F1b756C0cE3b29A2928",
    collateralManager: "0x382c41175ebC9c906Fb52148AFFD7aFB5158ECcf",
  },
  {
    asset: ADDRESSES.mantle.AUSD,
    lendingPool: "0x55A31051066bA19b765f2B8D49FE68367C2094ef",
    collateralManager: "0x99845253B0d208f977f14756Fa5C93B73ca73CA6",
  },
  {
    asset: ADDRESSES.mantle.sUSDe,
    lendingPool: "0x768f82Ca2055A7068FeA33f22b5a3cC8681598Ef",
    collateralManager: "0xa7C81aA29409Fd2a4D26b3ea4529a4413dc6a352",
  },
  {
    asset: ADDRESSES.mantle.FBTC,
    lendingPool: "0x72c7d27320e042417506e594697324dB5Fbf334C",
    collateralManager: "0x0e27103CD0002ED9694E8865BEfd6e2167132BA9",
  },
];

async function tvl(api) {
  const lendingPoolTvls = await api.multiCall({
    abi: "uint256:getTotalSupply",
    calls: CONTRACTS.map((contract) => contract.lendingPool),
  });

  for (const [index, lendingPoolTvl] of lendingPoolTvls.entries()) {
    api.add(CONTRACTS[index].asset, lendingPoolTvl);
  }

  await sumTokens2({
    api,
    tokensAndOwners: [
      ...CONTRACTS.map((contract) => [contract.asset, contract.collateralManager,]),
    ],
  });
}

module.exports = {
  mantle: {
    tvl,
  },
};
