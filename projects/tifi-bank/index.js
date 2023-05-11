const { getUniTVL } = require('../helper/unknownTokens')
const { sumTokensExport } = require("../helper/unknownTokens");
const { stakings } = require('../helper/staking')

const stakingContracts = [
  // Staking in the RESERVIOR
  "0x0AEfF3d761F6706295f3828C87ccE29c9418a93B",
  // Loan
  "0x8A6F7834A9d60090668F5db33FEC353a7Fb4704B",
  // Lock to Earn
  "0xA015263066da13e94526a8b897eDB0E3cd55B19A"
];

const lpContract = [
  //PinkLock TIFI Bank 
  "0x407993575c91ce7643a4d4ccacc9a98c36ee1bbe",
  //PinkLock Cake
  "0x7ee058420e5937496f5a2096f04caa7721cf70cc"
]

const lpTokens = [
  // TiFi bank LP token
  "0x707B6F02fFC0C7fD9fe3a4F392Aef47218021337",
  // Cake LP token
  "0xB62BB233Af2F83028Be19626256A9894B68AAe5E"
]


module.exports = {
  bsc: {
    tvl: getUniTVL({ chain: 'bsc', factory: '0xb3456550c17128ca7ebbcc47d4be6cae29d43853', }),
    staking: stakings(stakingContracts, '0x17E65E6b9B166Fb8e7c59432F0db126711246BC0', 'bsc'),
    // pool2: sumTokensExport({ tokens: lpTokens, owners: lpContract, useDefaultCoreAssets: true }),
  }
}
