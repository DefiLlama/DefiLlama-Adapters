const { yieldHelper } = require("../helper/unknownTokens");

const chain = "base";
const tokenAPI = "address:want"

const vaults = [
  "0xd08d16B94A52157fdf43E339D2C895307B11df7A",
  "0x283f716a69ecaE4Ee54A3b13C2bDF6eDE1533F1E",
  "0x07B95C056683E917AE0Bd7b5BEEf0b6eF344ddc4",
  "0x8f43543b224f8E3561bDCDcCAe9724a1be750215",
  "0x9300b216bB1168B6C41EC9D68cE61AE9665276f7",
  "0xF88C14d209A1b6eeA3BA32e4aC2792Cb6F99cf2C",
  "0x7DbB6C880561e722843E9Fd76B8a1b78E70DB6f1",
  "0x53CC8dC2113826232CBABCBC700046Aa4086a889",
  "0x4e7346170c5a501Ecf6D62eD4f08Ad03685F6Fae",
  "0x98712E37C8755f827BBF06A4E6f2d2B66716dE86",
  "0xd3b0EE65EA90F8a897A087516EAE123cc65157B2",
  "0xcAC4aeEc40abBA8B9E0F063532a52f6a22490FE9",
  "0x1A00A13f1Fae8990d0264bd65139B0b5f07F8c3E",
  "0xb801A1f9E00fFE8ab838d943884D29a196c9687d",

]

module.exports = {
  [chain]: {
    tvl: async (_, _b, { [chain]: block }) => {
      return yieldHelper({ vaults, chain, block, tokenAPI});
    }
  }
}

