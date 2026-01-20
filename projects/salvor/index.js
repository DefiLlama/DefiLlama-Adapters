const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

module.exports.avax = {
  start: '2023-05-07',
  hallmarks: [
    [1702501200, "Salvor Lending Launch"]
  ],
  methodology: 'TVL counts AVAX coins in the Salvor Pool address:0xab4fe2d136efd7f8dfce3259a5e3c5e4c0130c80 and ERC20 assets in the Salvor Lending Pool address: 0x22e229d14dc80a1ea7ca7637173e8c6c36d60fe8',
  staking: staking("0x72b73fa1569dF9fF1aE9b29CD5b164Af6c02EbaA", "0xF99516BC189AF00FF8EfFD5A1f2295B67d70a90e"),
  tvl: sumTokensExport({
    owners: ["0xab4fe2d136efd7f8dfce3259a5e3c5e4c0130c80", "0x22e229d14dc80a1ea7ca7637173e8c6c36d60fe8"],
    tokens: [
      ADDRESSES.avax.WAVAX,
      ADDRESSES.avax.USDC,
      ADDRESSES.avax.USDt,
      ADDRESSES.avax.JOE,
      "0x420FcA0121DC28039145009570975747295f2329",
      "0xAcFb898Cff266E53278cC0124fC2C7C94C8cB9a5",
      "0xB8d7710f7d8349A506b75dD184F05777c82dAd0C",
      "0x184ff13B3EBCB25Be44e860163A5D8391Dd568c1",
      "0x5Ac04b69bDE6f67C0bd5D6bA6fD5D816548b066a",
      "0xAAAB9D12A30504559b0C5a9A5977fEE4A6081c6b",
      "0x60781C2586D68229fde47564546784ab3fACA982",
      "0xec3492a2508DDf4FDc0cD76F31f340b30d1793e6",
      "0x8aD25B0083C9879942A64f00F20a70D3278f6187",
      "0xE8385CECb013561b69bEb63FF59f4d10734881f3",
      "0x65378b697853568da9ff8eab60c13e1ee9f4a654",
      "0x4f94b8aef08c92fefe416af073f1df1e284438ec",
      "0x201d04f88bc9b3bdacdf0519a95e117f25062d38",
      "0x46b9144771cb3195d66e4eda643a7493fadcaf9d",
      "0xebb5d4959b2fba6318fbda7d03cd44ae771fc999",
      "0x18e3605b13f10016901eac609b9e188cf7c18973",
      "0x4d6ec47118f807ace03d3b3a4ee6aa96cb2ab677",
      "0x694200a68b18232916353250955be220e88c5cbb",
      "0x03f77458e1eb9fa72b8186b573e40b106442f155",
      "0x6ec18092ee47fcc8f1fe15899156ff20c64ab3d7",
      "0x4a5bb433132b7e7f75d6a9a3e4136bb85ce6e4d5",
      "0x8f56421dc48dcce052d9afc80b696291ddaa832a",
      "0x56b9f5e181550b40472fd8c10a34e4ee6009c304",
      "0xc8e7fb72b53d08c4f95b93b390ed3f132d03f2d5",
      "0x7a842a6f4580edd3df41c1f31e0395044de6bc75",
      ADDRESSES.avax.BTC_b,
      "0xb44b645b5058f7e393f3ae6af58a4cef67006196",
      "0xc654721fbf1f374fd9ffa3385bba2f4932a6af55",
      "0xffff003a6bad9b743d658048742935fffe2b6ed7",
      "0x69260b9483f9871ca57f81a90d91e2f96c2cd11d",
      "0x1c7c53aa86b49a28c627b6450091998e447a42f9",
      nullAddress
    ]
  }),
};
