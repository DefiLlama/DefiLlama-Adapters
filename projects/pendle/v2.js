const ADDRESSES = require("../helper/coreAssets.json");
const contracts = require("./contracts");
const { staking } = require("../helper/staking");
const { getLogs } = require("../helper/cache/getLogs");
const bridgedAssets = [ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.EETH];
const { getConfig } = require('../helper/cache');

const config = {
  ethereum: {
    factory: "0x27b1dacd74688af24a64bd3c9c1b143118740784",
    fromBlock: 16032059,
    factories: [
      { factory: "0x1a6fcc85557bc4fb7b534ed835a03ef056552d52", fromBlock: 18669498 },  // v3
      { factory: "0x3d75bd20c983edb5fd218a1b7e0024f1056c7a2f", fromBlock: 20323253 },  // v4
      { factory: "0x6fcf753f2c67b83f7b09746bbc4fa0047b35d050", fromBlock: 20512280 },  // v5
    ],
  },
  arbitrum: {
    factory: "0xf5a7de2d276dbda3eef1b62a9e718eff4d29ddc8",
    fromBlock: 62979673,
    factories: [
      { factory: "0x2fcb47b58350cd377f94d3821e7373df60bd9ced", fromBlock: 154873897 },  // v3
      { factory: "0xd9f5e9589016da862d2abce980a5a5b99a94f3e8", fromBlock: 233004891 },  // v4
      { factory: "0xd29e76c6f15ada0150d10a1d3f45accd2098283b", fromBlock: 242035998 },  // v5
    ],
  },
  bsc: {
    factory: "0x2bea6bfd8fbff45aa2a893eb3b6d85d10efcc70e",
    fromBlock: 34060741,
    factories: [
      { factory: "0xc40febf5a33b8c92b187d9be0fd3fe0ac2e4b07c", fromBlock: 33884419 },  // v3
      { factory: "0x7d20e644d2a9e149e5be9be9ad2ab243a7835d37", fromBlock: 40539593 },  // v4
      { factory: "0x7c7f73f7a320364dbb3c9aaa9bccd402040ee0f9", fromBlock: 41294178 },  // v5
    ],
    pts: [
      "0x5ec2ae0afdec891e7702344dc2a31c636b3627eb",
      "0x70c1138b54ba212776d3a9d29b6160c54c31cd5d",
      "0x04eb6b56ff53f457c8e857ca8d4fbc8d9a531c0c",
      "0x541b5eeac7d4434c8f87e2d32019d67611179606",
      "0x5d1735b8e33bae069708cea245066de1a12cd38d"
    ],
  },
  optimism: {
    factory: "0x17f100fb4be2707675c6439468d38249dd993d58",
    fromBlock: 108061448,
    factories: [
      { factory: "0x4a2b38b9cbd83c86f261a4d64c243795d4d44abc", fromBlock: 112783590 },  // v3
      { factory: "0x73be47237f12f36203823bac9a4d80dc798b7015", fromBlock: 122792017 },  // v4
      { factory: "0x02adf72d5d06a9c92136562eb237c07696833a84", fromBlock: 123998311 },  // v5
    ],
  },
  mantle: {
    factories: [
      { factory: "0xd228ec1f7d4313fe321fab511a872475d07f5ba6", fromBlock: 61484384 },  // v3
      { factory: "0xca274a44a52241c1a8efb9f84bf492d8363929fc", fromBlock: 66526601 },  // v4
      { factory: "0xcb02435716b0143d4ac1bdf370302d619e714126", fromBlock: 67661738 },  // v5
    ],
  },
};

module.exports = {};

Object.keys(config).forEach((chain) => {
  const { factory, fromBlock, pts, factories, } = config[chain];
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
      for (let { factory, fromBlock } of factories) {
        logs.push(
          ...(await getLogs({
            api,
            target: factory,
            eventAbi:
              "event CreateNewMarket (address indexed market, address indexed PT, int256 scalarRoot, int256 initialAnchor, uint256 lnFeeRateRoot)",
            onlyArgs: true,
            fromBlock,
          }))
        );
      }

      const pt = logs.map((i) => i.PT);
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
        let value = supply[i] * 10 ** (v.decimals - 
          (sy[i].toLowerCase() == '0x7b5a43070bd97c2814f0d8b3b31ed53450375c19' // case for vbnb
           ? 18 : decimals[i]));
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
