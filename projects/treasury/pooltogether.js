const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require("../helper/treasury");
const {
  sumTokensExport,
  sumTokens,
  sumTokens2,
} = require("../helper/unwrapLPs");

const pullTreasury = "0x42cd8312D2BCe04277dD5161832460e95b24262E";
const vesting = "0x21950E281bDE1714ffd1062ed17c56D4D8de2359";
const optreasury = "0x8d352083F7094dc51Cd7dA8c5C0985AD6e149629";
const polytreasury = "0x3feE50d2888F2F7106fcdC0120295EBA3ae59245";
const POOL = "0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e";

const tokens = [
  nullAddress,
  ADDRESSES.ethereum.USDC, //USDC
  ADDRESSES.ethereum.DAI, //DAI
  "0x028171bCA77440897B824Ca71D1c56caC55b68A3", //aDAI
  ADDRESSES.ethereum.WETH, //WETH
  ADDRESSES.ethereum.USDT, //USDT
  "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F", //GTC
  "0x4da27a545c0c5B758a6BA100e3a049001de870f5", //stkAAVE
  "0xdd4d117723C257CEe402285D3aCF218E9A8236E1", // ptausdc
  ADDRESSES.ethereum.STETH, // stETH
  "0xD5f60154BEf3564EbFBe9bB236595f0da548a742", // spethwin
];

async function ethOwnTokens(timestamp, block) {
  const balances = {};
  const tokensAndOwners = [
    [POOL, pullTreasury],
    [POOL, vesting],
  ];
  await sumTokens(balances, tokensAndOwners, block);
  await sumTokens2({ balances, owner: pullTreasury, resolveUniV3: true, block });
  return balances;
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      tokens,
      owners: [pullTreasury, vesting],
    }),
    ownTokens: ethOwnTokens,
  },
  optimism: {
    tvl: sumTokensExport({
      tokens: [
        nullAddress,
        ADDRESSES.optimism.OP, // OP
      ],
      owners: [optreasury],
    }),
  },
  polygon: {
    tvl: sumTokensExport({
      tokens: [
        nullAddress,
        "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4", // StMATIC
      ],
      owners: [polytreasury],
    }),
  },
};
