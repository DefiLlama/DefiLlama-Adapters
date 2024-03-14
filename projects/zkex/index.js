const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const Pools = {
  polygon: ["0x3C7c0ebFCD5786ef48df5ed127cdDEb806db976c"],
  avax: ["0xfB0Ad0B3C2605A7CA33d6badd0C685E11b8F5585"],
  bsc: ["0x7bd79DEd935B542fb22c74305a4d2A293C18483a"],
  arbitrum: ["0xe469c1330ceecc375fe17e7d649ea270186d344f"],
  optimism: ["0xa194fb4eab262ec9886a119609bbb2800bdd3a2e"],
  era: ["0x3E3C7c1DCbAf343d14da4F0A0CD7E3c4b9765A4c"],
  linea: ["0x2Fad6cB2A9Db68395Ba4f87ff05768485C7fa6Fd"],
  base: ["0xaa46d98049cd895e980b60abc4af18cae681865a"],
  op_bnb: ["0x85079cb83b6cadba34e64bc0f24493f49d8b1f4e"]
};

const TokenAddress = {
  polygon: [ADDRESSES.polygon.USDC, ADDRESSES.polygon.DAI, ADDRESSES.polygon.USDT, ADDRESSES.polygon.WMATIC_1],
  avax: [ADDRESSES.null, ADDRESSES.avax.USDC, ADDRESSES.avax.USDt],
  bsc: [ADDRESSES.null,
    "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3"  // DAI
  ],
  arbitrum: [ADDRESSES.null, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.ARB],
  optimism: [ADDRESSES.null, ADDRESSES.optimism.USDC, ADDRESSES.optimism.USDT, ADDRESSES.optimism.OP],
  era: [
    ADDRESSES.null,
    ADDRESSES.era.USDC
  ],
  linea: [ADDRESSES.null, ADDRESSES.linea.USDC, ADDRESSES.linea.USDT],
  base: [ADDRESSES.null],
  op_bnb: [ADDRESSES.null]
};
module.exports = {
  polygon: {
    tvl: sumTokensExport({
      owners: Pools.polygon,
      tokens: TokenAddress.polygon
    })
  },
  avax: {
    tvl: sumTokensExport({
      owners: Pools.avax,
      tokens: TokenAddress.avax
    })
  },
  bsc: {
    // tvl: bscTvl
    tvl: sumTokensExport({
      owners: Pools.bsc,
      tokens: TokenAddress.bsc
    })
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners: Pools.arbitrum,
      tokens: TokenAddress.arbitrum
    })
  },
  optimism: {
    tvl: sumTokensExport({
      owners: Pools.optimism,
      tokens: TokenAddress.optimism
    })
  },
  era: {
    tvl: sumTokensExport({
      owners: Pools.era,
      tokens: TokenAddress.era
    })
  },
  linea: {
    tvl: sumTokensExport({
      owners: Pools.linea,
      tokens: TokenAddress.linea
    })
  },
  base: {
    tvl: sumTokensExport({
      owners: Pools.base,
      tokens: TokenAddress.base
    })
  },
  op_bnb: {
    tvl: sumTokensExport({
      owners: Pools.op_bnb,
      tokens: TokenAddress.op_bnb
    })
  }
};