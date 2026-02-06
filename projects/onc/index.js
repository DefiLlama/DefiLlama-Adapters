const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: "Gets TVL inside the ONC Treasury.",
  era: {
    tvl: sumTokensExport({
      owner: "0x581f87De7a655f50932F706873fcc7024d2309Fa", tokens: [
        ADDRESSES.era.USDC, // USDC
        "0x4BEf76b6b7f2823C6c1f4FcfEACD85C24548ad7e", // DAI
      ]
    }),
  },
  kava: {
    tvl: sumTokensExport({
      owner: "0x481654217A24B43fB63a7761d7033Fdf9361eAB6", tokens: [
        ADDRESSES.kava.WKAVA, // WKAVA
      ]
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owner: "0xc9cb7AB00802165e316A6f8c241E87E0Ee72e787", tokens: [
        ADDRESSES.arbitrum.USDC, // USDC
        ADDRESSES.arbitrum.USDT, // USDT
        ADDRESSES.optimism.DAI, // DAI
      ]
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owner: "0x7c24b813089675cf5484afa4850FE9276D97b461", tokens: [
        ADDRESSES.bsc.BUSD, // BUSD
        ADDRESSES.bsc.USDC, // USDC
        ADDRESSES.bsc.USDT, // USDT
        ADDRESSES.bsc.DAI, // DAI
      ]
    }),
  },
  avax: {
    tvl: sumTokensExport({
      owner: "0xD5a7Df8B56d285011AbE406235109c029F45797A", tokens: [
        ADDRESSES.avax.USDC, // USDC
        ADDRESSES.avax.USDt, // USDT
        ADDRESSES.avax.DAI, // DAI
      ]
    }),
  },
};
