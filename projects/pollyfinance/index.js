const ADDRESSES = require('../helper/coreAssets.json')
const {sumTokens2} = require("../helper/unwrapLPs");

const polly = "0x4C392822D4bE8494B798cEA17B43d48B2308109C";
const masterchef = "0x850161bF73944a8359Bd995976a34Bb9fe30d398";

const pool2LPs = [
  "0xd0fa2eaa5d854f184394e93f7b75624084600685",
  "0x1534d7c91bd77eb447acb7fb92ea042b918f58bb",
  "0xf27c14aedad4c1cfa7207f826c64ade3d5c741c3",
  "0x095fc71521668d5bcc0fc3e3a9848e8911af21d9",
  "0xf70b37a372befe8c274a84375c233a787d0d4dfa",
  "0x0c98d36908dfbe11C9A4d1F3CD8A9b94bAbA7521"
];

const sushiLPs = [
  "0xdFA3dDd1807DB8E4B4851D2E5421374e433a2983",
  "0xce5B8977f5021f1EF1232B1D4a0CFd03E8BCBa9B",
  "0x5e5C517Ec55d6393d91d6A1379e5Ae393A01a423",
  "0xc56060aF39152C614fA67E169c0DD1809a886e4F",
  "0xb5846453B67d0B4b4Ce655930Cf6E4129F4416D7",
  "0x396E655C309676cAF0acf4607a868e0CDed876dB",
  "0xc67136e235785727a0d3B5Cfd08325327b81d373",
  "0x9021A31062A1D9C9C35d632Ed54a9d923e46809F",
  "0xbf61E1D82bD440cb9da11d325c046f029a663890",
  "0x14dBE3e6814FD532EF87E4bE9b4192C018752823",
  "0x74D23F21F780CA26B47Db16B0504F2e3832b9321",
  "0x116Ff0d1Caa91a6b94276b3471f33dbeB52073E7",
  "0x6be10c5C7178af8C49997D07d6A5444C15e58170",
  "0x2481cBe674FB72cF8CD3031Ff4747078d168c9b3",
];

const nDefi = "0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B";
const nDefiUnderLying = [
  "0x28424507fefb6f7f8E9D3860F56504E4e5f5f390",
  "0x4257EA7637c355F81616050CbB6a9b709fd72683",
  "0x172370d5cd63279efa6d502dab29171933a610af",
  "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
  "0x6f7C932e7684666C9fd1d44527765433e01fF61d",
  "0x50b728d8d964fd00c2d0aad81718b71311fef68a",
  "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
  "0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c",
  "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
  "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3",
  "0xda537104d6a5edd53c6fbba9a898708e465260b6",
  "0x95c300e7740D2A88a44124B424bFC1cB2F9c3b89",
  "0xc81278a52AD0e1485B7C3cDF79079220Ddd68b7D",
  ADDRESSES.polygon.WMATIC_2,
  "0x3066818837c5e6ed6601bd5a91b0762877a6b731",
  "0xb33eaad8d922b1083446dc23f610c2567fb5180f",
  "0x3AE490db48d74B1bC626400135d4616377D0109f"
]

const nStbl = "0x9Bf320bd1796a7495BB6187f9EB4Db2679b74eD3";
const nStblUnderLying = [
  "0x00e5646f60AC6Fb446f621d146B6E1886f002905",
  "0x27F8D03b3a2196956ED754baDc28D73be8830A6e",
  "0x60D55F02A771d515e077c9C2403a1ef324885CeC",
  "0x1a13F4Ca1d028320A707D99520AbFefca3998b7F"
]

async function tvl(api) {
  let balances = {};
  await Promise.all([
    sumTokens2({ api, owner: nDefi, tokens: nDefiUnderLying, balances, }),
    sumTokens2({ api, owner: nStbl, tokens: nStblUnderLying, balances,}),
    sumTokens2({ api, owner: masterchef, tokens: sushiLPs, balances,}),
  ])
  return balances
}

async function pool2(api) {
  return sumTokens2({ api, owner: masterchef, tokens: pool2LPs})
}

module.exports = {
  methodology: "TVL includes tokens staked in farms and tokens used as collateral for nDEFI and nSTBL",
  polygon: {
    tvl,
    pool2
  },
}