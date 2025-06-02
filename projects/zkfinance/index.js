const { compoundExports2 } = require("../helper/compound");
const zksyncComptroller = "0x218EBB63dfDf74eA689fBb2C55964E00ec905332";
const zkEther = "0x36002f692234cDF2f115Ee701a9899DCB69F19d8";

module.exports = {
  era: compoundExports2({
    comptroller: zksyncComptroller,
    cether: zkEther,
  }),
};

module.exports.deadFrom = '2024-11-11'
module.exports.era.borrowed=  () => ({})
module.exports.hallmarks = [
  ['2024-11-11', "Protocol Exploit"],
]
