const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  ethereum: {
    owners: [
      "0x76B0aB5067B3be922ef4698390Ca8bd5812A5080",
      "0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab",
    ],
  },
  ripple: {
    owners: [
      "rpQATJWPPdNMxVCTQDYcnRNwtFDnanT3nk",
      "rsTbV9cNvGJfQdnHdVx9WNRZ5jFEizHjT5",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.bitunixCex,
  },
  tron: {
    owners: [
      "THoW5StbzYdfhh9XUopYYhPJbJWJehoCjo",
      "TDcgiw8HxnhHEhwPf7PYu5RUMpP7EygAXr",
      "THgxDnzzGJYhZXnKKXm6cg1594vhLzmTGx",
      "TRLEKU5ySBEoCSAFUuzYyZN5wxbx2Ho2jt",
      "TG3NXULKi8WVUFtw7Lg7RM6ahGyvY5mhC2",
      "TAS4yce3Jh5Rrk94SrViMq9mER3NXkqUXi",
      "TVUuCWs6mUVvMrB527mVspe6nfh4nUdDWR",
      "TFmCzjvmDN3Juk5VbLPctbZ3gx2ziK8ui4",
    ],
  },
  arbitrum: {
    owners: ["0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab"],
  },
  bsc: {
    owners: ["0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab"],
  },
  base: {
    owners: ["0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab"],
  },
  avax: {
    owners: ["0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab"],
  },
  polygon: {
    owners: ["0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab"],
  },
  optimism: {
    owners: ["0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab"],
  },
  solana: {
    owners: ["9jA4MUtsPAXy3ZhsiQUhkSXMop2ogrCWYv7rE9xovsWp"],
  },
  litecoin: {
    owners: ["ltc1qcnt4f7zqpu2s4pde3h4sjrkn3ekmlvr8ytk3s5"],
  },
  ton: {
    owners: ["UQDQ6wuXpMMUy4f-kNkDDyW05V5Exx7d40OaopVd11uzkMRt"],
  },
  cardano: {
    owners: [
      "addr1qxawa6kw3wxtqxdaegrcph045lpqh3gkk4t9xj0ype676n59qwmq25cjka2q0zsjp0dq8a8c8v83p4p0twrp4q04a08sdm3epa",
    ],
  },
};

module.exports = cexExports(config);
