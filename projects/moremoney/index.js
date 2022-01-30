/*==================================================
  Modules
  ==================================================*/

const sdk = require("@defillama/sdk");

const IsolatedLending = "0xDc5CCAAA928De5D318605A76eEDE50f205Aa6D93";
const CurvePoolRewards = "0x9727D535165e19590013bdDea8Fd85dd618b9aF7";
const account = "0x0000000000000000000000000000000000000000";
const methodology = "";
const { BigNumber } = require("ethers");
const tokenListJson = require("./tokenList.json");

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  const stratMeta = (
    await sdk.api.abi.call({
      target: IsolatedLending,
      block,
      chain: "avax",
      abi: {
        inputs: [],
        name: "viewAllStrategyMetadata",
        outputs: [
          {
            components: [
              {
                internalType: "uint256",
                name: "debtCeiling",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalDebt",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "stabilityFee",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "mintingFee",
                type: "uint256",
              },
              {
                internalType: "address",
                name: "strategy",
                type: "address",
              },
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "APF",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalCollateral",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "borrowablePer10k",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "valuePer1e18",
                type: "uint256",
              },
              {
                internalType: "bytes32",
                name: "strategyName",
                type: "bytes32",
              },
              {
                internalType: "uint256",
                name: "tvl",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "harvestBalance2Tally",
                type: "uint256",
              },
              {
                internalType: "enum IStrategy.YieldType",
                name: "yieldType",
                type: "uint8",
              },
              {
                internalType: "address",
                name: "underlyingStrategy",
                type: "address",
              },
            ],
            internalType: "struct IsolatedLending.ILStrategyMetadata[]",
            name: "",
            type: "tuple[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    })
  ).output;

  const stakingMeta = (
    await sdk.api.abi.call({
      target: CurvePoolRewards,
      block,
      chain: "avax",
      params: [account],
      abi: {
        inputs: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "stakingMetadata",
        outputs: [
          {
            components: [
              {
                internalType: "address",
                name: "stakingToken",
                type: "address",
              },
              {
                internalType: "address",
                name: "rewardsToken",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "totalSupply",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "tvl",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "aprPer10k",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "vestingCliff",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "periodFinish",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "stakedBalance",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "vestingStart",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "earned",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "rewards",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "vested",
                type: "uint256",
              },
            ],
            internalType: "struct VestingStakingRewards.StakingMetadata",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    })
  ).output;

  const tokensMeta = Object.values(stratMeta).map((strat) => {
    return strat.token;
  });
  const decimals = await Promise.all(
    tokensMeta.map((token) => {
      return sdk.api.erc20.decimals(token, "avax");
    })
  );

  const tokenList = [
    tokensMeta.map((token, index) => {
      return { address: token, decimals: decimals[index].output };
    }),
    ...tokenListJson.tokens,
  ];

  const tvlsFarm = stakingMeta.tvl;

  const tvlNoFarm = Object.values(stratMeta)
    .map((row) => {
      return { ...row, tvl: new BigNumber.from(row.tvl) };
    })
    .map((strat) => {
      let decimals = tokenList.filter((t) => t.address === strat.token)[0]
        ?.decimals;
      return {
        ...strat,
        tvlInPeg: decimals
          ? strat.tvl.mul(strat.valuePer1e18).div((10 ** decimals).toString())
          : 0,
      };
    })
    .reduce((tvl, row) => {
      return tvl.add(row.tvlInPeg);
    }, new BigNumber.from(0));

  const tvl = tvlNoFarm.add(tvlsFarm);

  return {
    "avax:0xd586e7f844cea2f87f50152665bcbc2c279d8d70": tvl.toString(),
  };
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  methodology: methodology,
  avalanche: {
    tvl,
  },
};
