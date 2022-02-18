const sdk = require("@defillama/sdk");
const { ethers } = require("ethers");

const IsolatedLending = "0xDc5CCAAA928De5D318605A76eEDE50f205Aa6D93";
const StableLending = "0x079126585b0a96fD0A76B45B59be0c54F93b6424";
const CurvePoolRewards = "0x9727D535165e19590013bdDea8Fd85dd618b9aF7";
const account = "0x0000000000000000000000000000000000000000";
const methodology = "";
const BigNumber = require("bignumber.js");
const tokenListJson = require("./tokenlist.json");
const addresses = require("./addresses.json");
const StrategyViewer = require("./StrategyViewer.json");

function useAddresses() {
  return addresses[43114];
}

async function tvl(timestamp, block) {
  const addresses = useAddresses();
  const provider = new ethers.providers.JsonRpcProvider(
    "https://api.avax.network/ext/bc/C/rpc"
  );
  const token2Strat = {
    ["0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"]:
      addresses.YieldYakAVAXStrategy,
    ["0x60781C2586D68229fde47564546784ab3fACA982"]: addresses.YieldYakStrategy,
    ["0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7"]: addresses.YieldYakStrategy,
    ["0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd"]: addresses.YieldYakStrategy,
    ["0xd586e7f844cea2f87f50152665bcbc2c279d8d70"]: addresses.YieldYakStrategy,
    ["0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5"]: addresses.YieldYakStrategy,
    ["0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"]: addresses.YieldYakStrategy,
    ["0x454E67025631C065d3cFAD6d71E6892f74487a15"]:
      addresses.TraderJoeMasterChefStrategy,
    ["0x2148D1B21Faa7eb251789a51B404fc063cA6AAd6"]:
      addresses.SimpleHoldingStrategy,
  };

  const masterChef2Tokens = [
    "0x57319d41f71e81f3c65f2a47ca4e001ebafd4f33",
    "0xa389f9430876455c36478deea9769b7ca4e3ddb1",
    "0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256",
    "0xd5a37dc5c9a396a03dd1136fc76a1a02b1c88ffa",
  ];

  const tokens = Object.keys(token2Strat);
  const strats = Object.values(token2Strat);
  const stratViewer = new ethers.Contract(
    addresses.StrategyViewer,
    StrategyViewer.abi,
    provider
  );
  const normalResults = await stratViewer.viewMetadata(
    addresses.StableLending,
    tokens,
    strats
  );
  const noHarvestBalanceResults =
    await stratViewer.viewMetadataNoHarvestBalance(
      addresses.StableLending,
      addresses.OracleRegistry,
      addresses.Stablecoin,
      masterChef2Tokens,
      Array(masterChef2Tokens.length).fill(
        addresses.TraderJoeMasterChef2Strategy
      )
    );

  const stratMeta = [...normalResults, ...noHarvestBalanceResults];
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
