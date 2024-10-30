const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const owners = ["0x1c3f35F7883fc4Ea8C4BCA1507144DC6087ad0fb", "0xfE03be1b0504031e92eDA810374222c944351356","0xef7aF0804AAB3885da59a8236fabfA19DDc6Cf48"];
const opbnb_owners = ["0xA2E2F3726DF754C1848C8fd1CbeA6aAFF84FC5B2", "0x1EbEd4024308afcb05E6938eF8Ebd1ec5d6E8C46", "0x1Bc6F42D6D1680115A52F82DFA29265085E91d93"];
const manta_owners = ["0xA2E2F3726DF754C1848C8fd1CbeA6aAFF84FC5B2", "0x1EbEd4024308afcb05E6938eF8Ebd1ec5d6E8C46", "0x471C5e8Cc0fEC9aeeb7ABA6697105fD6aaaDFf99","0xa10f74374b8bE9E9C8Fb62c1Dc17B8D4247E332A"];
const manta_stone_token = "0xEc901DA9c68E90798BbBb74c11406A32A70652C3";
const manat_manta_token = "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5";
const taiko_owners = ["0x735D00A9368164B9dcB2e008d5Cd15b367649aD5", "0x235C5C450952C12C8b815086943A7bBCF96bc619","0x2646E743A8F47b8d2427dBcc10f89e911f2dBBaa"];
const bsquared_owners = ["0xA2E2F3726DF754C1848C8fd1CbeA6aAFF84FC5B2", "0x1EbEd4024308afcb05E6938eF8Ebd1ec5d6E8C46","0xB20Faa4BA0DdEbDe49299557f4F1ebB5532745e3"];
const base_owners = ["0x43E3E6FFb2E363E64cD480Cbb7cd0CF47bc6b477", "0x7BC8D56cC78cF467C7230B77De0fcBDea9ac44cE","0xdf5ACC616cD3ea9556EC340a11B54859a393ebBB"];

module.exports = {
  start: 1690971144,
  bsc: { tvl: sumTokensExport({ owners, tokens: [
    ADDRESSES.bsc.USDT, ADDRESSES.ethereum.FDUSD, ADDRESSES.scroll.STONE,
    ADDRESSES.bsc.WBNB, //WBNB
    '0xba2ae424d960c26247dd6c32edc70b295c744c43', //DOGE
    ADDRESSES.bsc.BTCB, //BTCB
    '0xb0b84d294e0c75a6abe60171b70edeb2efd14a1b',//slisBNB
    '0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5',//lisUSD
    ADDRESSES.bsc.USDC, //usdc
    
  ], }) },
  op_bnb: {
    tvl: sumTokensExport({ owners: opbnb_owners, tokens: [
      ADDRESSES.op_bnb.USDT, 
      ADDRESSES.base.DAI, //FDUSD
      ADDRESSES.optimism.WETH_1, //WBNB
      ADDRESSES.defiverse.USDC, //BTCB
      ADDRESSES.defiverse.ETH, //ETH
    ] })
  },
  manta: {
    tvl: sumTokensExport({ owners: manta_owners, tokens: [
      ADDRESSES.manta.USDT, manta_stone_token, manat_manta_token,
      '0x7746ef546d562b443ae4b4145541a3b1a3d75717', //vMANTA
      ADDRESSES.manta.USDC, //USDC
      ] })
  },
  taiko: {
    tvl: sumTokensExport({ owners: taiko_owners, tokens: [
      ADDRESSES.taiko.USDC,
      ADDRESSES.taiko.USDC_e, //USDC.e
      ] })
  },
  bsquared: {
    tvl: sumTokensExport({ owners: bsquared_owners, tokens: [
      ADDRESSES.bsquared.USDT,
      ADDRESSES.bsquared.USDC, //USDC
      ADDRESSES.bsquared.BSTONE, //BSTONE
      ADDRESSES.bsquared.UBTC,//uBTC
      ] })
  },
  base: {
    tvl: sumTokensExport({ owners: base_owners, tokens: [
      ADDRESSES.base.USDC, //USDC
      '0x3b86ad95859b6ab773f55f8d94b4b9d443ee931f', //SolvBTC
      '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',//cbBTC
      ] })
  },
};
