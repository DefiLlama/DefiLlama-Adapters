const owner = "0xb2b11D8DA4cd9c20410de6EB55BAD2734983040E";
const target = "0x0DFCb45EAE071B3b846E220560Bbcdd958414d78";
const { staking } = require('../helper/staking')

module.exports = {
  bsc: {
    tvl: () => ({}),
    staking: staking(owner, target),
  },
  methodology: "We count all LIBERO deposited into LIBERO BANK, which has been locked by users in exchange for xLIBERO",
};