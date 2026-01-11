const { staking } = require('../helper/staking');
const qaostakeContract = "0x053b759c880b69075a52e4374efa08e6b5196ad0"
const qao = "0x3402e15b3ea0f1aec2679c4be4c6d051cef93953"

module.exports = {
ethereum:{
  staking: staking(qaostakeContract, qao),
  tvl: () => ({})
},
}
module.exports.deadFrom = '2023-04-09'