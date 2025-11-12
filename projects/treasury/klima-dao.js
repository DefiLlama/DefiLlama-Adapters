const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");


const klimaTreasury1 = "0x7dd4f0b986f032a44f913bf92c9e8b7c17d77ad7";
const daoWallet_polygon = "0x65A5076C0BA74e5f3e069995dc3DAB9D197d995c"
const daoWallet_base = "0xa79cd47655156b299762dfe92a67980805ce5a31"

const KLIMA_polygon = "0x4e78011ce80ee02d2c3e649fb657e45898257815"; // on polygon
const KLIMA_base = "0xdcefd8c8fcc492630b943abcab3429f12ea9fea2"; // on base

const AERO = "0x940181a94A35A4569E4529A3CDfB74e38FD98631";
const aeroVotingEscrow = "0xebf418fe2512e7e6bd9b87a8f0f294acdc67e6b4";

// aerodrome pools
// const vAMM_WETH_KLIMA = "0xB37642E87613d8569Fd8Ec80888eA6c63684E79e"

const veAEROIds = [
  "22922",
  "20882",
  "20680",
  "19983",
];

module.exports = treasuryExports({
  polygon: {
    tokens: [
      nullAddress,
      '0x2F800Db0fdb5223b3C3f354886d907A671414A7F', // BCT
      ADDRESSES.polygon.USDC, // USDC
      ADDRESSES.polygon.USDC_CIRCLE,
      ADDRESSES.polygon.USDT,
      '0xD838290e877E0188a4A44700463419ED96c16107', // NCT
      '0xAa7DbD1598251f856C12f63557A4C4397c253Cea', // MCO2
      '0x2B3eCb0991AF0498ECE9135bcD04013d7993110c', // UBO
      '0x6BCa3B77C1909Ce1a4Ba1A20d1103bDe8d222E48', // NBO
      '0x5786b267d35F9D011c4750e0B0bA584E1fDbeAD1', // USDC/KLIMA SLP
      '0x9803c7aE526049210a1725F7487AF26fE2c24614', // BCT/KLIMA SLP
      '0xb2D0D5C86d933b0aceFE9B95bEC160d514d152E1', // NCT/KLIMA SLP
      '0x64a3b8cA5A7e406A78e660AE10c7563D9153a739', // MCO2/KLIMA Quickswap LP
      '0x5400A05B8B45EaF9105315B4F2e31F806AB706dE', // UBO/KLIMA SLP
      '0x251cA6A70cbd93Ccd7039B6b708D4cb9683c266C', // NBO/KLIMA SLP
      "0x1E67124681b402064CD0ABE8ed1B5c79D2e02f64", // USDC.e-BCT Sushi LP
      "0x4D2263FF85e334C1f1d04C6262F6c2580335a93C", // KLIMA-CCO2 Sushi LP

      // Carbon
      "0x03E3369af9390493CB7CC599Cd5233D50e674Da4", // MOSS
      "0xad01DFfe604CDc172D8237566eE3a3ab6524d4C6", // C3
      "0x672688C6Ee3E750dfaA4874743Ef693A6f2538ED", // CRISP-C
      "0x82B37070e43C1BA0EA9e2283285b674eF7f1D4E2", // CCO2
    ],
    owners: [klimaTreasury1, daoWallet_polygon],
    ownTokens: [KLIMA_polygon],
  },
  base: {
    tokens: [
      nullAddress,
      ADDRESSES.base.USDC, // USDC
      //ADDRESSES.base.USDT,
      ADDRESSES.base.WETH,
      '0x576Bca23DcB6d94fF8E537D88b0d3E1bEaD444a2', // BCT (base address)
      '0x20b048fa035d5763685d695e66adf62c5d9f5055', // CHAR
      AERO,
      '0x16E1846aaFD6ecf91De676e7B6fc23f09a83F258', // WOOD
    ],
    solidlyVeNfts: [
      { baseToken: AERO, veNft: aeroVotingEscrow},
    ],
    owners: [daoWallet_base],
    ownTokens: [KLIMA_base],
  },
});
