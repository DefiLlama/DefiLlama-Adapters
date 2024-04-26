const { ethers } = require("ethers");
const { getLogs } = require("../helper/cache/getLogs");

async function tvl(api) {
  const factories = config[api.chain];

  const promises = factories.map(async ({ factory, fromBlock, name }) => {
    const logs = await getLogs({
      api,
      target: factory,
      eventAbi: name.includes("FX Pool")
        ? "event NewFXPool(address indexed caller, bytes32 indexed id, address indexed fxpool)"
        : "event NewCurve(address indexed caller, bytes32 indexed id, address indexed curve)",
      onlyArgs: true,
      fromBlock,
    });

    if (name.includes("FX Pool")) {
      const pools = logs.map((i) => i.fxpool);
      const poolIds = await api.multiCall({
        abi: "function getPoolId() view returns (bytes32)",
        calls: pools,
      });
      const vaults = await api.multiCall({
        abi: "address:getVault",
        calls: pools,
      });

      const data = await api.multiCall({
        abi: "function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)",
        calls: poolIds.map((v, i) => ({ target: vaults[i], params: v })),
      });

      data.forEach((i) => {
        api.addTokens(i.tokens, i.balances);
      });
    } else if (name.includes("CurveFactory")) {
      const pools = logs
        .map((i) => i.curve)
        .filter((p) => !ignoredPools[api.chain].includes(p));

      const data = await api.multiCall({
        abi: "function liquidity() view returns (uint256 total_, uint256[] memory individual_)",
        calls: pools.map((v) => ({ target: v })),
      });

      // Curve.derivatives(0)
      const derivatives0 = await api.multiCall({
        abi: "function derivatives(uint256 index) view returns (address token_address)",
        calls: pools.map((v) => ({ target: v, params: "0" })),
      });

      const derivatives0Decimals = await api.multiCall({
        abi: "function decimals() view returns (uint8 decimals)",
        calls: derivatives0.map((v) => ({ target: v })),
      });

      // Curve.derivatives(1)
      const derivatives1 = await api.multiCall({
        abi: "function derivatives(uint256 index) view returns (address token_address)",
        calls: pools.map((v, i) => ({ target: v, params: "1" })),
      });

      const derivatives1Decimals = await api.multiCall({
        abi: "function decimals() view returns (uint8 decimals)",
        calls: derivatives1.map((v) => ({ target: v })),
      });

      data.forEach((d, i) => {
        const divisor0 = ethers.parseUnits(
          "1",
          parseInt(derivatives0Decimals[i])
        );

        const baseTokenBalance =
          (BigInt(d.individual_[0]) / ethers.parseUnits("1", parseInt(18))) *
          divisor0;

        const divisor1 = ethers.parseUnits(
          "1",
          parseInt(derivatives1Decimals[i])
        );
        const quoteTokenBalance =
          (BigInt(d.individual_[1]) / ethers.parseUnits("1", parseInt(18))) *
          divisor1;

        api.addTokens(
          [derivatives0[i], derivatives1[i]],
          [baseTokenBalance.toString(), quoteTokenBalance.toString()]
        );
      });
    }
  });
  await Promise.all(promises);
  return api.getBalances();
}

module.exports = {
  methodology: "sum of all the tokens locked in FX Pools",
  doublecounted: true, // tokens are stored in balancer vaults
};

const config = {
  polygon: [
    {
      name: "FX Pool Factory",
      factory: "0x627D759314D5c4007b461A74eBaFA7EBC5dFeD71",
      fromBlock: 32054794,
    },
    {
      name: "FX Pool Deployer",
      factory: "0xF169c1Ae8De24Da43a3dC5c5F05De412b4848bD3",
      fromBlock: 49368321,
    },
    {
      name: "CurveFactory",
      factory: "0x6bfBc74eb37d44DE6E44B0B63F04CbA626009Ff5",
      fromBlock: 18910303,
    },
  ],
  ethereum: [
    {
      name: "FX Pool Factory",
      factory: "0x81fE9e5B28dA92aE949b705DfDB225f7a7cc5134",
      fromBlock: 15981805,
    },
    {
      name: "FX Pool Deployer",
      factory: "0xfb23Bc0D2629268442CD6521CF4170698967105f",
      fromBlock: 18469425,
    },
    {
      name: "CurveFactory",
      factory: "0xFA505d02269bF4Ea59355a4e37fBd882122717e5",
      fromBlock: 13221583,
    },
  ],
  avax: [
    {
      name: "FX Pool Factory",
      factory: "0x81fE9e5B28dA92aE949b705DfDB225f7a7cc5134",
      fromBlock: 32585313,
    },
    {
      name: "FX Pool Deployer",
      factory: "0x4042dC4110Ea9500338737605A60065c3de152C6",
      fromBlock: 37150792,
    },
  ],
};

const ignoredPools = {
  ethereum: [
    "0x20E1d8Daf58358CF11BE5616946e1dF55F1eF8B0",
    "0xc3CfdA7061b729265F58BdC07564f1cbD6C41FBc",
  ],
  polygon: [],
  avax: [],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
