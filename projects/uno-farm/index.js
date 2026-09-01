const { sumTokens2 } = require("../helper/unwrapLPs");
const { getUserMasterChefBalances } = require("../helper/masterchef");
const apps = {
  "polygon": [
    {
      "poolInfoABI": [
        "function lpToken(uint256) view returns (address lpToken)"
      ],
      "masterChefs": ["0x0769fd68dFb93167989C6f7254cd0D766Fb2841F"],
      "factory": "0xb8698FbDFcd6044fA9C56938a50D7D0FDD22e8F0",
      "name": "sushiswap"
    },
    {
      "poolInfoABI": [
        "function lpToken(uint256) view returns (address lpToken)"
      ],
      "masterChefs": ["0x54aff400858Dcac39797a81894D9920f16972D1D"],
      "factory": "0x35E19FD59212985209339aDD9fe0649604ffB7Be",
      "name": "apeswap"
    },
    {
      "name": "balancer",
      "factory": "0xBAE4733e8E761DE20DF4Cd2c62823776489957e8"
    },
    {
      "name": "quickswap",
      "factory": "0x56888a3c0BC31a0b83bCd6cCd4dC2726E26239D7"
    }
  ],
  "bsc": [
    {
      "poolInfoABI": [
        "function lpToken(uint256) view returns (address lpToken)"
      ],
      "masterChefs": ["0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652"],
      "factory": "0xd62c64a8846d704c7775679982219e477dcB564A",
      "name": "pancakeswap"
    },
    {
      "poolInfoABI": [
        "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accWeVEPerShare)"
      ],
      "masterChefs": ["0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9"],
      "factory": "0x50cE50F5c2835D3A9c257A27D814E8d2C039449b",
      "lpExtractor": ["tuple"],
      "name": "apeswap"
    }
  ],
  "aurora": [
    {
      "poolInfoABI": [
        "function lpToken(uint256) view returns (address lpToken)"
      ],
      "masterChefs": ["0x3838956710bcc9D122Dd23863a0549ca8D5675D6"],
      "factory": "0x552f55dDbCD8a5e2ae6f07b5e369675A62c1F957",
      "name": "Trisolaris Stable"
    },
    {
      "poolInfoABI": [
        "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accWeVEPerShare)",
        "function lpToken(uint256) view returns (address lpToken)"
      ],
      "masterChefs": [
        "0x1f1Ed214bef5E83D8f5d0eB5D7011EB965D0D79B",
        "0x3838956710bcc9D122Dd23863a0549ca8D5675D6"
      ],
      "lpExtractor": ["tuple", "simple"],
      "factory": "0x64c9899fcdB6f9565Ba69B0939Aec51e320C5489",
      "name": "Trisolaris Standard"
    }
  ],
  "avax": [
    {
      "poolInfoABI": [
        "function poolInfo(uint256) view returns (address lpToken, uint96 allocPoint, uint256 accJoePerShare, uint256 accJoePerFactorPerShare, uint64 lastRewardTimestamp, address rewarder, uint32 veJoeShareBp,  uint256 totalFactor,  uint256 totalLpSupply)",
        "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accWeVEPerShare)"
      ],
      "masterChefs": [
        "0x4483f0b6e2F5486D06958C20f8C39A7aBe87bf8F",
        "0x188bED1968b795d5c9022F6a0bb5931Ac4c18F00"
      ],
      "lpExtractor": ["tuple", "tuple"],
      "factory": "0x6Eae93D177BFDDAF5ee238F55C36A847A35E62A0",
      "name": "Traderjoe"
    }
  ]
};

const factoryAbi = {
  poolLength: "uint256:poolLength",
  pools: "function pools(uint256) view returns (address)",
  Farms: "function Farms(address) view returns (address)",
};

/** Get all farm addresses from a UnoFarm factory */
async function getFarms(api, factory) {
  const lpTokens = await api.fetchList({ lengthAbi: factoryAbi.poolLength, itemAbi: factoryAbi.pools, target: factory });
  return api.multiCall({ abi: factoryAbi.Farms, target: factory, calls: lpTokens });
}

/** Get farms paired with their LP tokens */
async function getFarmsWithLPs(api, factory) {
  const lpTokens = await api.fetchList({ lengthAbi: factoryAbi.poolLength, itemAbi: factoryAbi.pools, target: factory });
  const farms = await api.multiCall({ abi: factoryAbi.Farms, target: factory, calls: lpTokens });
  return farms.map((farm, i) => ({ farm, lpToken: lpTokens[i] }));
}

const LP_EXTRACTORS = {
  simple: (output) => output,
  tuple: (output) => output[0],
};

async function defaultTVL(api, app) {
  const farms = await getFarms(api, app.factory);
  const promises = [];
  for (let k = 0; k < app.masterChefs.length; k++) {
    const extractorName = app.lpExtractor?.[k] ?? "simple";
    const getLPAddress = LP_EXTRACTORS[extractorName] ?? null;
    for (const farm of farms) {
      promises.push(
        getUserMasterChefBalances({
          balances: api.getBalances(),
          masterChefAddress: app.masterChefs[k],
          userAddres: farm,
          block: api.block,
          chain: api.chain,
          poolInfoABI: app.poolInfoABI[k],
          getLPAddress,
        })
      );
    }
  }
  await Promise.all(promises);
}

async function balancerTVL(api, app) {
  const farmsData = await getFarmsWithLPs(api, app.factory);
  const gauges = await api.multiCall({ abi: "address:gauge", calls: farmsData.map((v) => v.farm) });
  const tokensAndOwners = farmsData.map((v, i) => [gauges[i], v.farm]);
  return sumTokens2({ api, tokensAndOwners });
}

async function quickswapTVL(api, app) {
  const farmsData = await getFarmsWithLPs(api, app.factory);
  const stakeTokens = await api.multiCall({ abi: "address:lpPair", calls: farmsData.map((v) => v.farm), permitFailure: true });
  const valid = farmsData.map((v, i) => ({ ...v, stakeToken: stakeTokens[i] })).filter((v) => v.stakeToken);
  const tokensAndOwners = valid.map((v) => [v.stakeToken, v.farm]);
  await sumTokens2({ api, tokensAndOwners, resolveLP: true });
}

const TVL_HANDLERS = { balancer: balancerTVL, quickswap: quickswapTVL };

async function tvl(api) {
  const chainApps = apps[api.chain] ?? [];
  await Promise.all(
    chainApps.map((app) => (TVL_HANDLERS[app.name] ?? defaultTVL)(api, app))
  );
}

module.exports = {
  start: '2022-06-23',
  polygon: { tvl },
  bsc: { tvl },
  aurora: { tvl },
  avax: { tvl },
};
