const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        ADDRESSES.ethereum.TUSD, // TUSD
        ADDRESSES.ethereum.USDT, // USDT
        ADDRESSES.ethereum.USDC, // USDC
        ADDRESSES.ethereum.DAI, // DAI
        "0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E", // crvUSDC
        "0x390f3595bCa2Df7d23783dFd126427CCeb997BF4", // crvUSDT
        "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490", // 3Crv
        "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff", // crv3crypto
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
        "0xb7ecb2aa52aa64a717180e030241bc75cd946726", // tBTC/WBTC
      ],
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0x4D15a3A2286D883AF0AA1B3f21367843FAc63E07", // TUSD
        ADDRESSES.arbitrum.USDT, // USDT
        ADDRESSES.arbitrum.USDC, // usdc.e
        ADDRESSES.optimism.DAI, // DAI
        "0xec090cf6DD891D2d014beA6edAda6e05E025D93d", // crvUSDC
        "0x82670f35306253222F8a165869B28c64739ac62e", // 3c-crvUSD
        "0x73aF1150F265419Ef8a5DB41908B700C32D49135", // crvUSDT
        "0x7f90122BF0700F9E7e1F688fe926940E8839F353", // 2CRV
        "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH
        "0x186cf879186986a20aadfb7ead50e3c20cb26cec", // 2BTC-ng
      ],
    }),
  },
  polygon: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756", // TUSD
        ADDRESSES.polygon.USDT, // USDT
        ADDRESSES.polygon.USDC, // usdc.e
        ADDRESSES.polygon.DAI, // DAI
        "0x5225010a0ae133b357861782b0b865a48471b2c5", // crvUSDC
        "0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171", // aave
        "0xa70af99bff6b168327f9d1480e29173e757c7904", // crvUSDT
        "0xdad97f7713ae9437fa9249920ec8507e5fbb23d3", // crv3crypto
        "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6", // WBTC
      ],
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        ADDRESSES.bsc.TUSD, // TUSD
        ADDRESSES.bsc.USDT, // USDT
        ADDRESSES.bsc.USDC, // usdc.e
        "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", // DAI
        "0xc4ec3ab41182e70ca45a764ffc5c45b9a82ccc97", // crvUSDC
        "0xA5E0E46462970C9Ee8C2ECadcde254c483748Ec4", // b3pool
        "0xae87e5fa20f335ce14aa3b9e0616308d9ac7d4ce", // crvUSDT
        "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", // BTCB
      ],
    }),
  },
  optimism: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0xcB59a0A753fDB7491d5F3D794316F1adE197B21E", // TUSD
        ADDRESSES.optimism.USDT, // USDT
        ADDRESSES.optimism.USDC, // usdc.e
        ADDRESSES.optimism.DAI, // DAI
        "0x03771e24b7c9172d163bf447490b142a15be3485", // crvUSDC
        "0x1337bedc9d22ecbe766df105c9623922a27963ec", // 3pool
        "0xd1b30ba128573fcd7d141c8a987961b40e047bb6", // crvUSDT
        "0x4200000000000000000000000000000000000006", // WETH
        "0x1dc5c0f8668a9f54ed922171d578011850ca0341", // 2BTC
      ],
    }),
  },
  avax: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB", // TUSD
        ADDRESSES.avax.USDt, // USDT
        ADDRESSES.avax.USDC, // usdc.e
        ADDRESSES.avax.DAI, // DAI
        "0x1337BedC9D22ecbe766dF105c9623922A27963EC", // av3crv
        "0x1daB6560494B04473A0BE3E7D83CF3Fdf3a51828", // crv3crypto
        "0x152b9d0FdC40C096757F570A51E494bd4b943E50", // BTC.b
      ],
    }),
  },
  base: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0xf6C5F01C7F3148891ad0e19DF78743D31E390D1f", // 4pool
        "0x4200000000000000000000000000000000000006", // WETH
        "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf", // cbBTC
      ],
    }),
  },
  xdai: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0x1337bedc9d22ecbe766df105c9623922a27963ec", // x3CRV
      ],
    }),
  },
  blast: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0x4300000000000000000000000000000000000004", // WETH
      ],
    }),
  },
  mantle: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111", // WETH
      ],
    }),
  },
  linea: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f", // WETH
        "0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4", // WBTC
      ],
    }),
  },
  taiko: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0xa51894664a773981c6c112c43ce576f315d5b1b6", // WETH
      ],
    }),
  },
};
