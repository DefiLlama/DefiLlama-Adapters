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
        ADDRESSES.ethereum.WETH, // WETH
        "0xb7ecb2aa52aa64a717180e030241bc75cd946726", // tBTC/WBTC
        ADDRESSES.ethereum.CRV, // CRV
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
        ADDRESSES.arbitrum.WETH, // WETH
        "0x186cf879186986a20aadfb7ead50e3c20cb26cec", // 2BTC-ng
        "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978", // CRV
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
        ADDRESSES.polygon.WBTC, // WBTC
        ADDRESSES.polygon.WETH_1, // WETH
        "0x172370d5cd63279efa6d502dab29171933a610af", // CRV
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
        ADDRESSES.bsc.BTCB, // BTCB
        ADDRESSES.bsc.ETH, // ETH
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
        ADDRESSES.optimism.WETH_1, // WETH
        "0x1dc5c0f8668a9f54ed922171d578011850ca0341", // 2BTC
        "0x0994206dfe8de6ec6920ff4d779b0d950605fb53", // CRV
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
        ADDRESSES.avax.BTC_b, // BTC.b
        ADDRESSES.avax.WETH_e, // WETH.e
      ],
    }),
  },
  base: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0xf6C5F01C7F3148891ad0e19DF78743D31E390D1f", // 4pool
        ADDRESSES.optimism.WETH_1, // WETH
        ADDRESSES.ethereum.cbBTC, // cbBTC
        "0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415", // CRV
      ],
    }),
  },
  xdai: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0x1337bedc9d22ecbe766df105c9623922a27963ec", // x3CRV
        ADDRESSES.xdai.WETH, // WETH
      ],
    }),
  },
  blast: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        ADDRESSES.blast.WETH, // WETH
        ADDRESSES.blast.USDB, // USDB
      ],
    }),
  },
  mantle: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        ADDRESSES.mantle.WETH, // WETH
        ADDRESSES.mantle.USDC, // USDC
      ],
    }),
  },
  linea: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        ADDRESSES.linea.WETH, // WETH
        "0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4", // WBTC
        ADDRESSES.linea.USDC, // USDC.e
      ],
    }),
  },
  taiko: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        ADDRESSES.taiko.WETH, // WETH
        ADDRESSES.taiko.USDC, // USDC
      ],
    }),
  },
  celo: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0x28f209844029755fc563c1bd4fd21f42dc7ce0e4", // Tri-pool
      ],
    }),
  },
  fraxtal: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0xcaef324bea3ff5c7a08710081294f3344ffadc54", // FRAX/USDT
        "0xfc00000000000000000000000000000000000006", // wfrxETH
        "0x331b9182088e2a7d6d3fe4742aba1fb231aecc56", // CRV
      ],
    }),
  },
  kava: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        ADDRESSES.kava.USDt, // USDt
      ],
    }),
  },
  metis: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        ADDRESSES.metis.WETH, // WETH
      ],
    }),
  },
  mode: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        ADDRESSES.optimism.WETH_1, // WETH
      ],
    }),
  },
  manta: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        ADDRESSES.manta.WETH, // WETH
        ADDRESSES.manta.USDT, // USDT
      ],
    }),
  },
  sonic: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        ADDRESSES.sonic.WETH, // WETH
        ADDRESSES.sonic.USDC_e, // usdc.e
      ],
    }),
  },
  fantom: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        ADDRESSES.fantom.USDC, // USDC,
        '0x2F733095B80A04b38b0D10cC884524a3d09b836a', // USDC.e
      ]
    })
  }
};
