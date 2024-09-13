const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0x0000000000085d4780B73119b644AE5ecd22b376", // TUSD
        "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
        "0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E", // crvUSDC
        "0x390f3595bCa2Df7d23783dFd126427CCeb997BF4", // crvUSDT
        "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490", // 3Crv
        "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff", // crv3crypto
      ],
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0x4D15a3A2286D883AF0AA1B3f21367843FAc63E07", // TUSD
        "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
        "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // usdc.e
        "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI
        "0xec090cf6DD891D2d014beA6edAda6e05E025D93d", // crvUSDC
        "0x82670f35306253222F8a165869B28c64739ac62e", // 3c-crvUSD
        "0x73aF1150F265419Ef8a5DB41908B700C32D49135", // crvUSDT
        "0x7f90122BF0700F9E7e1F688fe926940E8839F353", // 2CRV
      ],
    }),
  },
  polygon: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756", // TUSD
        "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // usdc.e
        "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", // DAI
        "0x5225010a0ae133b357861782b0b865a48471b2c5", // crvUSDC
        "0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171", // aave
        "0xa70af99bff6b168327f9d1480e29173e757c7904", // crvUSDT
        "0xdad97f7713ae9437fa9249920ec8507e5fbb23d3", // crv3crypto
      ],
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9", // TUSD
        "0x55d398326f99059fF775485246999027B3197955", // USDT
        "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // usdc.e
        "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", // DAI
        "0xc4ec3ab41182e70ca45a764ffc5c45b9a82ccc97", // crvUSDC
        "0xA5E0E46462970C9Ee8C2ECadcde254c483748Ec4", // b3pool
        "0xae87e5fa20f335ce14aa3b9e0616308d9ac7d4ce", // crvUSDT
      ],
    }),
  },
  optimism: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0xcB59a0A753fDB7491d5F3D794316F1adE197B21E", // TUSD
        "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // USDT
        "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // usdc.e
        "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI
        "0x03771e24b7c9172d163bf447490b142a15be3485", // crvUSDC
        "0x1337bedc9d22ecbe766df105c9623922a27963ec", // 3pool
        "0xd1b30ba128573fcd7d141c8a987961b40e047bb6", // crvUSDT
      ],
    }),
  },
  avax: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB", // TUSD
        "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", // USDT
        "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // usdc.e
        "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", // DAI
        "0x1337BedC9D22ecbe766dF105c9623922A27963EC", // av3crv
        "0x1daB6560494B04473A0BE3E7D83CF3Fdf3a51828", // crv3crypto
      ],
    }),
  },
  base: {
    tvl: sumTokensExport({
      owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
      tokens: [
        "0xf6C5F01C7F3148891ad0e19DF78743D31E390D1f", // 4pool
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
};
