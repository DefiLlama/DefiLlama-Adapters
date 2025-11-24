const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  ethereum: {
    owners: ["0x76B0aB5067B3be922ef4698390Ca8bd5812A5080"],
  },
  ripple: {
    owners: ["rpQATJWPPdNMxVCTQDYcnRNwtFDnanT3nk"],
  },
  bitcoin: {
    owners: bitcoinAddressBook.bitunixCex,
  },
  tron: {
    owners: [
'THoW5StbzYdfhh9XUopYYhPJbJWJehoCjo',
'TDcgiw8HxnhHEhwPf7PYu5RUMpP7EygAXr',
'THgxDnzzGJYhZXnKKXm6cg1594vhLzmTGx',
'TRLEKU5ySBEoCSAFUuzYyZN5wxbx2Ho2jt',
'TG3NXULKi8WVUFtw7Lg7RM6ahGyvY5mhC2',
'TAS4yce3Jh5Rrk94SrViMq9mER3NXkqUXi',
'TVUuCWs6mUVvMrB527mVspe6nfh4nUdDWR',
'TFmCzjvmDN3Juk5VbLPctbZ3gx2ziK8ui4',
    ],
  },
};

module.exports = cexExports(config);
