const index = require('../fantOHM/index')
const { ohmTreasury } = require('../helper/treasury')
const { sumTokensExport } = require('../helper/unwrapLPs')

const fantomTreasuryContract = "0xA3b52d5A6d2f8932a5cD921e09DA840092349D71";
const fantomGnosisContract = "0x34F93b12cA2e13C6E64f45cFA36EABADD0bA30fC";
const ethTreasuryContract = "0x9042E869BedCD2BB3EEa241aC0032cadAE8DF006";

const ethTradfi3mContract = "0xCD8A46dC7EE4488b441Ae1CD3b5BCa48d5389C12";
const ethTradfi6mContract = "0xD9fDd86ecc03e34DAf9c645C40DF670406836816"
const ftmTradfi3mContract = "0xEFbe7fe9E8b407a3F0C0451E7669E70cDD0C4C77";
const ftmTradfi6mContract = "0xB1c77436BC180009709Be00C9e852246476321A3";
module.exports = ohmTreasury(index)

module.exports.fantom.ownTokens = sumTokensExport({
  owners: [fantomTreasuryContract, fantomGnosisContract, ftmTradfi3mContract, ftmTradfi6mContract, ],
  tokens: ['0x6fc9383486c163fa48becdec79d6058f984f62ca', '0xfa1FBb8Ef55A4855E5688C0eE13aC3f202486286']
})
module.exports.ethereum.ownTokens = sumTokensExport({
  owners: [ethTreasuryContract, ethTradfi3mContract, ethTradfi6mContract, ],
  tokens: ['0x02B5453D92B730F29a86A0D5ef6e930c4Cf8860B',]
})