const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const owners = ["0x1c3f35F7883fc4Ea8C4BCA1507144DC6087ad0fb", "0xfE03be1b0504031e92eDA810374222c944351356","0xef7aF0804AAB3885da59a8236fabfA19DDc6Cf48"];
const opbnb_owners = ["0xA2E2F3726DF754C1848C8fd1CbeA6aAFF84FC5B2", "0x1EbEd4024308afcb05E6938eF8Ebd1ec5d6E8C46", "0x1Bc6F42D6D1680115A52F82DFA29265085E91d93"];
const manta_owners = ["0xA2E2F3726DF754C1848C8fd1CbeA6aAFF84FC5B2", "0x1EbEd4024308afcb05E6938eF8Ebd1ec5d6E8C46", "0x471C5e8Cc0fEC9aeeb7ABA6697105fD6aaaDFf99","0xa10f74374b8bE9E9C8Fb62c1Dc17B8D4247E332A"];
const manta_stone_token = "0xEc901DA9c68E90798BbBb74c11406A32A70652C3";
const manat_manta_token = "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5";
const taiko_owners = ["0x735D00A9368164B9dcB2e008d5Cd15b367649aD5", "0x235C5C450952C12C8b815086943A7bBCF96bc619","0x2646E743A8F47b8d2427dBcc10f89e911f2dBBaa"];

module.exports = {
  start: 1690971144,
  bsc: { tvl: sumTokensExport({ owners, tokens: [ADDRESSES.bsc.USDT, ADDRESSES.ethereum.FDUSD, ADDRESSES.scroll.STONE], }) },
  op_bnb: {
    tvl: sumTokensExport({ owners: opbnb_owners, tokens: [ADDRESSES.op_bnb.USDT, ADDRESSES.base.DAI,ADDRESSES.optimism.WETH_1] })
  },
  manta: {
    tvl: sumTokensExport({ owners: manta_owners, tokens: [ADDRESSES.manta.USDT, manta_stone_token, manat_manta_token] })
  },
  taiko: {
    tvl: sumTokensExport({ owners: taiko_owners, tokens: [ADDRESSES.taiko.USDC] })
  },
};
