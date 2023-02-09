const { sumTokensExport } = require("../helper/unwrapLPs");

const SphereToken = "0x62f594339830b90ae4c084ae7d223ffafd9658a7";
const SphereLP = "0xf3312968c7D768C19107731100Ece7d4780b47B2"; // SPHERE/MATIC LP


module.exports = {
  // optimism TVL consists of investments/tokens in gnosis safe
  optimism: {
    tvl: sumTokensExport({
      tokens: [
        "0x4200000000000000000000000000000000000006", //WETH
        "0x4200000000000000000000000000000000000042", //OP
        "0x73cb180bf0521828d8849bc8CF2B920918e23032", //USD+
        "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", //USDC
      ],
      owner: "0x93B0a33911de79b897eb0439f223935aF5a60c24",
    }),
  },
  //Arbitrum TVL consists of investments/tokens in gnosis safe
  arbitrum: {
    tvl: sumTokensExport({
      tokens: [
        "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", //WETH
        "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", //GMX
        "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", //USDC
        "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", //USDT
        "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", //WBTC
      ],
      owner: "0xA6efac6a6715CcCE780f8D9E7ea174C4d85dbE02",
    }),
  },
  //binance TVL consists of investments/tokens in gnosis safe
  bsc: {
    tvl: sumTokensExport({
      tokens: [
        "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", //BUSD
        "0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1", //WOM
        "0x14016E85a25aeb13065688cAFB43044C2ef86784", //TUSD
        "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827", //ankrBNB
        "0xA60205802E1B5C6EC1CAFA3cAcd49dFeECe05AC9", //CONE
        "0x9f8BB16f49393eeA4331A39B69071759e54e16ea", //MDB+
        "0xD7FbBf5CB43b4A902A8c994D94e821f3149441c7", //UNKWN
      ],
      owner: "0x124E8498a25EB6407c616188632D40d80F8e50b0",
    }),
  },
  polygon: {
    tvl: sumTokensExport({
      tokens: [
        "0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6", //MATICx
        "0x255707B70BF90aa112006E1b07B9AeA6De021424", //TETU
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", //USDC
        "0x236eeC6359fb44CCe8f97E99387aa7F8cd5cdE1f", //USD+
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", //WETH
        "0x9246a5F10A79a5a939b0C2a75A3AD196aAfDB43b", //BETS
        "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", //WBTC
        "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", //USDT
        "0x1d734A02eF1e1f5886e66b0673b71Af5B53ffA94", //SD
    ],
        owner: "0x20D61737f972EEcB0aF5f0a85ab358Cd083Dd56a",
    }),
  },
};
