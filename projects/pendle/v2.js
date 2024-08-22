const ADDRESSES = require("../helper/coreAssets.json");
const contracts = require("./contracts");
const { staking } = require("../helper/staking");
const { getLogs } = require("../helper/cache/getLogs");
const bridgedAssets = [ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.EETH];
const { getConfig } = require('../helper/cache')

const config = {
  ethereum: {
    factory: "0x27b1dacd74688af24a64bd3c9c1b143118740784",
    factoryV3: "0x1a6fcc85557bc4fb7b534ed835a03ef056552d52",
    factoryV4: '0x3d75bd20c983edb5fd218a1b7e0024f1056c7a2f',
    factoryV5: '0x6fcf753f2c67b83f7b09746bbc4fa0047b35d050',
    fromBlock: 16032059,
    fromBlockV3: 18669498,
    fromBlockV4: 20323253,
    fromBlockV5: 20512280
  },
  arbitrum: {
    factory: "0xf5a7de2d276dbda3eef1b62a9e718eff4d29ddc8",
    factoryV3: "0x2fcb47b58350cd377f94d3821e7373df60bd9ced",
    factoryV4: '0xd9f5e9589016da862d2abce980a5a5b99a94f3e8',
    factoryV5: '0xd29e76c6f15ada0150d10a1d3f45accd2098283b',
    fromBlock: 62979673,
    fromBlockV3: 154873897,
    fromBlockV4: 233004891,
    fromBlockV5: 242035998
  },
  bsc: {
    factory: "0x2bea6bfd8fbff45aa2a893eb3b6d85d10efcc70e",
    factoryV3: "0xc40febf5a33b8c92b187d9be0fd3fe0ac2e4b07c",
    factoryV4: '0x7d20e644d2a9e149e5be9be9ad2ab243a7835d37',
    factoryV5: "0x7c7f73f7a320364dbb3c9aaa9bccd402040ee0f9",
    fromBlock: 34060741,
    fromBlockV3: 33884419,
    fromBlockV4: 40539593,
    fromBlockV5: 41294178,
    pts: [
      "0x5ec2ae0afdec891e7702344dc2a31c636b3627eb",
      "0x70c1138b54ba212776d3a9d29b6160c54c31cd5d",
      "0x04eb6b56ff53f457c8e857ca8d4fbc8d9a531c0c",
    ],
  },
  optimism: {
    factory: "0x17f100fb4be2707675c6439468d38249dd993d58",
    factoryV3: "0x4a2b38b9cbd83c86f261a4d64c243795d4d44abc",
    factoryV4: '0x73be47237f12f36203823bac9a4d80dc798b7015',
    factoryV5: "0x02adf72d5d06a9c92136562eb237c07696833a84",
    fromBlock: 108061448,
    fromBlockV3: 112783590,
    fromBlockV4: 122792017,
    fromBlockV5: 123998311
  },
  mantle: {
    factoryV3: "0xd228ec1f7d4313fe321fab511a872475d07f5ba6",
    factoryV4: '0xca274a44a52241c1a8efb9f84bf492d8363929fc',
    factoryV5: "0xcb02435716b0143d4ac1bdf370302d619e714126",
    fromBlockV3: 61484384,
    fromBlockV4: 66526601,
    fromBlockV5: 67661738
  },
};

module.exports = {};

Object.keys(config).forEach((chain) => {
  const { factory, factoryV3, factoryV4, factoryV5, fromBlock, pts, fromBlockV3, fromBlockV4, fromBlockV5 } = config[chain];
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

      const logsV4 = factoryV4
        ? await getLogs({
          api,
          target: factoryV4,
          topic: [
            "0xae811fae25e2770b6bd1dcb1475657e8c3a976f91d1ebf081271db08eef920af",
          ],
          eventAbi:
            "event CreateNewMarket (address indexed market, address indexed PT, int256 scalarRoot, int256 initialAnchor, uint256 lnFeeRateRoot)",
          onlyArgs: true,
          fromBlock: fromBlockV4,
        })
        : [];

      const logsV5 = factoryV5 ? await getLogs({
        api,
        target: factoryV5,
        topic: [
          "0xae811fae25e2770b6bd1dcb1475657e8c3a976f91d1ebf081271db08eef920af",
        ],
        eventAbi:
          "event CreateNewMarket (address indexed market, address indexed PT, int256 scalarRoot, int256 initialAnchor, uint256 lnFeeRateRoot)",
        onlyArgs: true,
        fromBlock: fromBlockV5,
      }) : [];

      // const pt =   logs.map((i) => i.PT).concat(logsV3.map((i) => i.PT)).concat(logsV4.map((i) => i.PT)).concat(logsV5.map((i) => i.PT));
      const pt = logs.concat(logsV3).concat(logsV4).concat(logsV5).map((i) => i.PT);
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
