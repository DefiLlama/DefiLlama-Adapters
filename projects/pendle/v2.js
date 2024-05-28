const ADDRESSES = require("../helper/coreAssets.json");
const contracts = require("./contracts");
const { staking } = require("../helper/staking");
const { getLogs } = require("../helper/cache/getLogs");
const bridgedAssets = [ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.EETH];
const { getConfig } = require('../helper/cache')

const config = {
  ethereum: {
    factory: "0x27b1dacd74688af24a64bd3c9c1b143118740784",
    factoryV3: "0x1A6fCc85557BC4fB7B534ed835a03EF056552D52",
    fromBlock: 16032059,
    fromBlockV3: 18669498,
  },
  arbitrum: {
    factory: "0xf5a7de2d276dbda3eef1b62a9e718eff4d29ddc8",
    factoryV3: "0x2FCb47B58350cD377f94d3821e7373Df60bD9Ced",
    fromBlock: 62979673,
    fromBlockV3: 154873897
  },
  bsc: {
    factory: "0x2bEa6BfD8fbFF45aA2a893EB3B6d85D10EFcC70E",
    factoryV3: "0xC40fEbF5A33b8C92B187d9be0fD3fe0ac2E4B07c",
    fromBlock: 34060741,
    fromBlockV3: 33884419,
    pts: [
      "0x5eC2ae0AFDEc891E7702344dc2A31C636B3627Eb",
      "0x70c1138B54ba212776d3A9d29b6160C54C31cd5d",
      "0x04eb6B56ff53f457c8E857ca8D4fbC8d9a531c0C",
    ],
  },
  optimism: {
    factory: "0x17F100fB4bE2707675c6439468d38249DD993d58",
    factoryV3: "0x4A2B38b9cBd83c86F261a4d64c243795D4d44aBC",
    fromBlock: 108061448,
    fromBlockV3: 112783590,
  },
  mantle: {
    factoryV3: "0xD228EC1f7D4313fe321fab511A872475D07F5bA6",
    fromBlockV3: 61484384,
  },
};

module.exports = {};

Object.keys(config).forEach((chain) => {
  const { factory, factoryV3, fromBlock, pts, fromBlockV3 } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = factory
        ? await getLogs({
          api,
          target: factory,
          topics: [
            "0x166ae5f55615b65bbd9a2496e98d4e4d78ca15bd6127c0fe2dc27b76f6c03143",
          ],
          eventAbi:
            "event CreateNewMarket (address indexed market, address indexed PT, int256 scalarRoot, int256 initialAnchor)",
          onlyArgs: true,
          fromBlock,
        })
        : [];

      const logsV3 = factoryV3
        ? await getLogs({
          api,
          target: factoryV3,
          topic: [
            "0xae811fae25e2770b6bd1dcb1475657e8c3a976f91d1ebf081271db08eef920af",
          ],
          eventAbi:
            "event CreateNewMarket (address indexed market, address indexed PT, int256 scalarRoot, int256 initialAnchor, uint256 lnFeeRateRoot)",
          onlyArgs: true,
          fromBlock: fromBlockV3,
        })
        : [];

      const pt = logs.map((i) => i.PT).concat(logsV3.map((i) => i.PT));
      if (pts) pt.push(...pts);
      let sy = [
        ...new Set(
          (
            await api.multiCall({
              abi: "address:SY",
              calls: pt,
            })
          ).map((s) => s.toLowerCase())
        ),
      ];

      sy = await filterWhitelistedSY(api, sy);
      const [data, supply, decimals] = await Promise.all([
        api.multiCall({
          abi: "function assetInfo() view returns (uint8 assetType , address uAsset , uint8 decimals )",
          calls: sy,
        }),
        api.multiCall({ abi: "erc20:totalSupply", calls: sy }),
        api.multiCall({ abi: "erc20:decimals", calls: sy }),
      ]);

      const tokenAssetTypeSy = sy.filter((_, i) => data[i].assetType === "0");
      const exchangeRates = await api.multiCall({
        abi: "function exchangeRate() view returns (uint256 res)",
        calls: tokenAssetTypeSy,
      });

      data.forEach((v, i) => {
        let value = supply[i] * 10 ** (v.decimals - decimals[i]);
        let index = tokenAssetTypeSy.indexOf(sy[i]);
        if (index !== -1) {
          value = (value * exchangeRates[index]) / 10 ** 18;
        }
        api.add(v.uAsset.toLowerCase(), value);
      });
      let balances = api.getBalances();

      for (let bridgingToken of bridgedAssets) {
        const bridged = `${chain}:${bridgingToken}`;
        if (bridged in balances) {
          balances[bridgingToken] = balances[bridged];
          delete balances[bridged];
        }
      }
      return balances;
    },
  };
});

// Prevent SY with malicious accounting from being included in TVL
async function filterWhitelistedSY(api, sys) {
  const { results } = await getConfig('pendle/v2-'+api.chain, `https://api-v2.pendle.finance/core/v1/${api.chainId}/sys/whitelisted`);
  const whitelistedSys = new Set(results.map((d) => d.address.toLowerCase()));
  return sys.filter((s) => whitelistedSys.has(s));
}

module.exports.ethereum.staking = staking(
  contracts.v2.vePENDLE,
  contracts.v2.PENDLE
);
