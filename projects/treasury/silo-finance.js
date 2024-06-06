const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const { mergeExports } = require('../helper/utils');

const ETHEREUM_MAINNET_TREASURIES = [
  "0xE8e8041cB5E3158A0829A19E014CA1cf91098554",
  "0xdaC29737b5FB121F11EE7f17dB0212F82b4AB009",
  "0xe1F03b7B0eBf84e9B9f62a1dB40f1Efb8FaA7d22",
  "0xDfF2aeA378e41632E45306A6dE26A7E0Fd93AB07",
  "0xC04f84A02cC65f14f4e8C982a7a467EE88c5311e",
  "0x9b85bc68fec59E0209189b475e0cF636c8264e02",
  "0xcFEedb0219A99bE73dFE04B2A9905a109Cf87823",
];

const SILO_ETHEREUM_MAINNET = "0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8";
const XAI_ETHEREUM_MAINNET = "0xd7C9F0e536dC865Ae858b0C0453Fe76D13c3bEAc";

const ARBITRUM_MAINNET_TREASURIES = [
  "0x865a1da42d512d8854c7b0599c962f67f5a5a9d9",
  "0x80071b39aA896aa12240c5194E42661D671bDFB2",
]

const SILO_ARBITRUM_MAINNET = "0x0341C0C0ec423328621788d4854119B97f44E391";

module.exports = mergeExports([
  treasuryExports({
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.LUSD,//LUSD
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
        ADDRESSES.ethereum.TOKE,//TOKE
        ADDRESSES.ethereum.CVX, // CVX
        ADDRESSES.ethereum.YFI, // YFI
        ADDRESSES.ethereum.CRV, // CRV
        ADDRESSES.ethereum.CRVUSD, // crvUSD
        "0xc944E90C64B2c07662A292be6244BDf05Cda44a7", // GRT
        "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0" // FXS
      ],
      owners: ETHEREUM_MAINNET_TREASURIES,
      ownTokens: [SILO_ETHEREUM_MAINNET, XAI_ETHEREUM_MAINNET],
      resolveUniV3: true,
      resolveVlCVX: true,
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.ARB, // ARB
        ADDRESSES.arbitrum.GMX, // GMX
        ADDRESSES.arbitrum.USDC_CIRCLE, // USDC Native
        ADDRESSES.arbitrum.USDC, // USDC.e (Bridged)
        "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55", // DPX
        "0x18c11FD286C5EC11c3b683Caa813B77f5163A122", // GNS
        "0x51fC0f6660482Ea73330E414eFd7808811a57Fa2", // PREMIA
        "0xd4d42F0b6DEF4CE0383636770eF773390d85c61A", // SUSHI
        "0x1622bF67e6e5747b81866fE0b85178a93C7F86e3", // UMAMI
        "0x539bdE0d7Dbd336b79148AA742883198BBF60342", // MAGIC
        "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0", // UNI
      ],
      owners: ARBITRUM_MAINNET_TREASURIES,
      ownTokens: [SILO_ARBITRUM_MAINNET],
    }
  }),
  {
    ethereum: { tvl }
  }
])

async function tvl(api) {
  const convexStakingProxy = '0x5754B88287A88dfA3d02cfb87747E340A840c70A'
  const fraxFarm = '0x4edF7C64dAD8c256f6843AcFe56876024b54A1b6'
  const liquidity = await api.call({ abi: 'function lockedLiquidityOf(address) view returns (uint256)', target: fraxFarm, params: convexStakingProxy })
  api.add('0x326290A1B0004eeE78fa6ED4F1d8f4b2523ab669', liquidity)
  return api.getBalances()
}