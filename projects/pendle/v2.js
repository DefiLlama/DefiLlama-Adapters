const ADDRESSES = require("../helper/coreAssets.json");
const contracts = require("./contracts");
const {
  staking
} = require("../helper/staking");
const {
  getLogs
} = require("../helper/cache/getLogs");
const bridgedAssets = [ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.EETH];
const {
  getConfig
} = require('../helper/cache');

// const scaledFactory = 0x992ec6a490a4b7f256bd59e63746951d98b29be9;

// can get deployments from https://github.com/pendle-finance/pendle-core-v2-public/blob/main/deployments
const config = {
  ethereum: {
    factory: "0x27b1dacd74688af24a64bd3c9c1b143118740784",
    fromBlock: 16032059,
    factories: [{
        factory: "0x1a6fcc85557bc4fb7b534ed835a03ef056552d52",
        fromBlock: 18669498
      }, // v3
      {
        factory: "0x3d75bd20c983edb5fd218a1b7e0024f1056c7a2f",
        fromBlock: 20323253
      }, // v4
      {
        factory: "0x6fcf753f2c67b83f7b09746bbc4fa0047b35d050",
        fromBlock: 20512280
      }, // v5
      {
        factory: "0x6d247b1c044fA1E22e6B04fA9F71Baf99EB29A9f", 
        fromBlock: 23638439
      }, // v6
    ],
  },
  arbitrum: {
    factory: "0xf5a7de2d276dbda3eef1b62a9e718eff4d29ddc8",
    fromBlock: 62979673,
    factories: [{
        factory: "0x2fcb47b58350cd377f94d3821e7373df60bd9ced",
        fromBlock: 154873897
      }, // v3
      {
        factory: "0xd9f5e9589016da862d2abce980a5a5b99a94f3e8",
        fromBlock: 233004891
      }, // v4
      {
        factory: "0xd29e76c6f15ada0150d10a1d3f45accd2098283b",
        fromBlock: 242035998
      }, // v5
      {
        factory: "0x49F2f7002669E0e4425Fa0203975625Ab4af3143", 
        fromBlock: 392471311
      }, // v6
    ],
  },
  bsc: {
    factory: "0x2bea6bfd8fbff45aa2a893eb3b6d85d10efcc70e",
    fromBlock: 34060741,
    factories: [{
        factory: "0xc40febf5a33b8c92b187d9be0fd3fe0ac2e4b07c",
        fromBlock: 33884419
      }, // v3
      {
        factory: "0x7d20e644d2a9e149e5be9be9ad2ab243a7835d37",
        fromBlock: 40539593
      }, // v4
      {
        factory: "0x7c7f73f7a320364dbb3c9aaa9bccd402040ee0f9",
        fromBlock: 41294178
      }, // v5
      {
        factory: "0x80cE46449DF1c977f6ba60495125ce282F83DdFB", 
        fromBlock: 65609031
      } // v6
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
    factories: [{
        factory: "0x4a2b38b9cbd83c86f261a4d64c243795d4d44abc",
        fromBlock: 112783590
      }, // v3
      {
        factory: "0x73be47237f12f36203823bac9a4d80dc798b7015",
        fromBlock: 122792017
      }, // v4
      {
        factory: "0x02adf72d5d06a9c92136562eb237c07696833a84",
        fromBlock: 123998311
      }, // v5
      {
        factory: "0x95a937f7064C75C6Bc257160088C0a9D58cca333", 
        fromBlock: 142803131
      } // v6
    ],
  },
  mantle: {
    factories: [{
        factory: "0xd228ec1f7d4313fe321fab511a872475d07f5ba6",
        fromBlock: 61484384
      }, // v3
      {
        factory: "0xca274a44a52241c1a8efb9f84bf492d8363929fc",
        fromBlock: 66526601
      }, // v4
      {
        factory: "0xcb02435716b0143d4ac1bdf370302d619e714126",
        fromBlock: 67661738
      }, // v5
      {
        factory: "0xa35AE21a593CB06959978E20b33Db34163166C79", 
        fromBlock: 86536378
      }, // v6
    ],
  },
  base: {
    factories: [{
        factory: "0x59968008a703dc13e6beaeced644bdce4ee45d13",
        fromBlock: 22350352
      }, // v3
      {
        factory: "0x81E80A50E56d10C501fF17B5Fe2F662bd9EA4590", 
        fromBlock: 37206684
      } // v6
    ],
  },
  sonic: {
    factories: [{
        factory: "0xfee31a6ec6ebefa0b5a594bf5b1139e3c6faa0fb",
        fromBlock: 7830430
      }, // v3
      {
        factory: "0x0AB3ae25c42a2f3748a018556989355D568Fa6d6", 
        fromBlock: 51621889
      } // v6
    ],
  },
  berachain: {
    factories: [{
        factory: "0x8A09574b0401A856d89d1b583eE22E8cb0C5530B",
        fromBlock: 806126
      }, // v3
      {
        factory: "0x6131CA76529250679cF9e2A3b07b135f20aAb01A", 
        fromBlock: 12146490
      } // v6
    ],
    pts: [
      '0x2719e657ec3b3cbe521a18e640ca55799836376f',
      '0xdc9b87e5efd6ca2beaa33dde9c544e1e98345de4'
    ]
  },
  hyperliquid: {
    factories: [{
        factory: "0x44A2DdF5339FfdE8c23AF4099a64Def59b11b128",
        fromBlock: 9665302
      }, // v5
      {
        factory: "0xB5CD902CbEF8461b8d6fa852f93784F090fd7BEb", 
        fromBlock: 17235435
      } // v6
    ],
  },
  plasma: {
    factories: [
      {
        factory: "0x28dE02Ac3c3F5ef427e55c321F73fDc7F192e8E4",
        fromBlock: 1887344
      }, // v5
      {
        factory: "0x84A240Fa784E7F03CB99BA3716065961c5d0D531", 
        fromBlock: 4278863
      } // v6
    ], 
  }
};


Object.keys(config).forEach((chain) => {
  const {
    factory,
    fromBlock,
    pts,
    factories,
  } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = factory ?
        await getLogs({
          api,
          target: factory,
          topics: [
            "0x166ae5f55615b65bbd9a2496e98d4e4d78ca15bd6127c0fe2dc27b76f6c03143",
          ],
          eventAbi: "event CreateNewMarket (address indexed market, address indexed PT, int256 scalarRoot, int256 initialAnchor)",
          onlyArgs: true,
          fromBlock,
        }) : [];
      for (let {
          factory,
          fromBlock
        }
        of factories) {
        logs.push(
          ...(await getLogs({
            api,
            target: factory,
            eventAbi: "event CreateNewMarket (address indexed market, address indexed PT, int256 scalarRoot, int256 initialAnchor, uint256 lnFeeRateRoot)",
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
      const [yieldTokens, supply] = await Promise.all([
        api.multiCall({
          abi: "function yieldToken() view returns (address)",
          calls: sy,
        }),
        api.multiCall({
          abi: "erc20:totalSupply",
          calls: sy
        }),
      ]);

      const unscaledInfo = await getUnscaledInfo(api, yieldTokens);
      const yieldTokenBals = await api.multiCall({
        abi: "function balanceOf(address) view returns (uint256)",
        calls: yieldTokens.map((t, i) => ({
          target: t,
          params: sy[i],
        })),
      })

      yieldTokens.forEach((yieldToken, i) => {
        const totalSupply = supply[i];
        if (yieldTokenBals[i] === "0" && totalSupply !== "0") {
          api.add(
            yieldToken.toLowerCase(),
            totalSupply
          );
        } else {
          if (unscaledInfo[yieldToken.toLowerCase()]) {
            const {
              rawAsset,
              rawDecimals
            } = unscaledInfo[yieldToken.toLowerCase()];
            yieldTokenBals[i] = (yieldTokenBals[i] * (10 ** rawDecimals) / (10 ** 18));
            yieldToken = rawAsset;
          }
          api.add(yieldToken.toLowerCase(), yieldTokenBals[i])
        }
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

async function getUnscaledInfo(api, yieldTokens) {
  const names = await api.multiCall({
    abi: "function name() view returns (string)",
    calls: yieldTokens,
  });

  const scaledPositions = names.reduce((acc, name, i) => {
    if (name.includes("scaled")) {
      acc.push(yieldTokens[i]);
    }
    return acc;
  }, []);

  const scaledYieldTokens = scaledPositions.map((p) => p.toLowerCase());

  const [rawAssets, rawDecimals] = await Promise.all([api.multiCall({
    abi: "function rawToken() external view returns (address)",
    calls: scaledYieldTokens
  }), api.multiCall({
    abi: "function rawDecimals() external view returns (uint8)",
    calls: scaledYieldTokens
  })]);

  const info = {}
  for (let i = 0; i < scaledYieldTokens.length; i++) {
    const yieldToken = scaledYieldTokens[i];
    info[yieldToken] = {
      rawAsset: rawAssets[i],
      rawDecimals: rawDecimals[i],
    };
  }
  return info;

}

// Prevent SY with malicious accounting from being included in TVL
async function filterWhitelistedSY(api, sys) {
  const {
    results
  } = await getConfig('pendle/v2-' + api.chain,
    `https://api-v2.pendle.finance/core/v1/${api.chainId}/sys/whitelisted`);
  const whitelistedSys = new Set(results.map((d) => d.address.toLowerCase()));
  return sys.filter((s) => whitelistedSys.has(s));
}

module.exports.ethereum.staking = staking(
  contracts.v2.vePENDLE,
  contracts.v2.PENDLE
);