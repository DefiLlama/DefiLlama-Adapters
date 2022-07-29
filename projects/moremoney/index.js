const sdk = require("@defillama/sdk");
const { ethers } = require("ethers");
const { getProvider } = require("@defillama/sdk/build/general");

const CurvePoolRewards = "0x9727D535165e19590013bdDea8Fd85dd618b9aF7";
const account = "0x0000000000000000000000000000000000000000";
const methodology = "";
const BigNumber = require("bignumber.js");
const addresses = require("./addresses.json");
const StrategyViewer = require("./StrategyViewer.json");
const StrategyRegistry = require("./StrategyRegistry.json");
const IStrategy = require("./IStrategy.json");

function useAddresses() {
  return addresses[43114];
}

async function tvl(timestamp, block) {
  const addresses = useAddresses();
  const provider = getProvider('avax');

  const stratRegistry = new ethers.Contract(
    addresses.StrategyRegistry,
    StrategyRegistry.abi,
    provider
  );

  const stratViewer = new ethers.Contract(
    addresses.StrategyViewer,
    StrategyViewer.abi,
    provider
  );

  const enabledStrategies = await stratRegistry.allEnabledStrategies();

  const approvedTokens = await Promise.all(
    enabledStrategies.map((address) => {
      const contract = new ethers.Contract(address, IStrategy.abi, provider);
      return contract.viewAllApprovedTokens();
    })
  );
  let token2Strat2 = {};

  for (let i = 0; i < enabledStrategies.length; i++) {
    const strategy = enabledStrategies[i];
    const tokens = approvedTokens[i];
    for (let j = 0; j < tokens.length; j++) {
      if (token2Strat2[tokens[j]] == undefined) {
        token2Strat2[tokens[j]] = strategy;
      }
    }
  }

  const tokens = Object.keys(token2Strat2);
  const strats = Object.values(token2Strat2);

  const noHarvestBalanceResults =
    await stratViewer.viewMetadataNoHarvestBalance(
      addresses.StableLending,
      addresses.OracleRegistry,
      addresses.Stablecoin,
      tokens,
      strats
    );

  const stratMeta = [...noHarvestBalanceResults];
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
  ];

  const tvlsFarm = stakingMeta.tvl;

  const tvlNoFarm = Object.values(stratMeta)
    .map((row) => {
      let decimals = tokenList.filter((t) => t.address === row.token)[0]
        ?.decimals;
      const trueOne = ethers.utils.parseUnits("1", decimals);
      const valPerOne = trueOne
        .mul(row.valuePer1e18)
        .div(ethers.utils.parseEther("1"));
      return {
        ...row,
        tvlInPeg: row.tvl.mul(valPerOne).div(trueOne),
      };
    })
    .reduce((tvl, row) => {
      return tvl.plus(row.tvlInPeg.toString());
    }, BigNumber(0));
  const tvl = tvlNoFarm.plus(tvlsFarm);
  return {
    "avax:0xd586e7f844cea2f87f50152665bcbc2c279d8d70": tvl.toFixed(0),
  };
}

module.exports = {
  methodology: methodology,
  avalanche: {
    tvl,
  },
};
