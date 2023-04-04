const { nullAddress } = require("../helper/treasury");
const {
  unwrapUniswapV3NFTs,
  sumTokensExport,
  sumTokens,
} = require("../helper/unwrapLPs");

const pullTreasury = "0x42cd8312D2BCe04277dD5161832460e95b24262E";
const vesting = "0x21950E281bDE1714ffd1062ed17c56D4D8de2359";
const optreasury = "0x8d352083F7094dc51Cd7dA8c5C0985AD6e149629";
const polytreasury = "0x3feE50d2888F2F7106fcdC0120295EBA3ae59245";
const POOL = "0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e";

const tokens = [
  nullAddress,
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //USDC
  "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI
  "0x028171bCA77440897B824Ca71D1c56caC55b68A3", //aDAI
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //WETH
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", //USDT
  "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F", //GTC
  "0x4da27a545c0c5B758a6BA100e3a049001de870f5", //stkAAVE
  "0xdd4d117723C257CEe402285D3aCF218E9A8236E1", // ptausdc
  "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // stETH
  "0xD5f60154BEf3564EbFBe9bB236595f0da548a742", // spethwin
];

async function ethOwnTokens(timestamp, block) {
  const balances = {};
  const tokensAndOwners = [
    [POOL, pullTreasury],
    [POOL, vesting],
  ];
  const nftsAndOwners = [
    ["0xC36442b4a4522E871399CD717aBDD847Ab11FE88", pullTreasury],
  ];
  await sumTokens(balances, tokensAndOwners, block);
  await unwrapUniswapV3NFTs({ balances, nftsAndOwners, block });
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
        "0x4200000000000000000000000000000000000042", // OP
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
