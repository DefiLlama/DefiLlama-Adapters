const { sumTokens2 } = require("../helper/chain/cardano");

const V1_POOL_SCRIPT_HASH = 'script1uychk9f04tqngfhx4qlqdlug5ntzen3uzc62kzj7cyesjk0d9me'
const V1_ORDER_SCRIPT_HASH = 'script15ew2tzjwn364l2pszu7j5h9w63v2crrnl97m074w9elrkxhah0e'
const V2_POOL_SCRIPT_HASH = 'script1agrmwv7exgffcdu27cn5xmnuhsh0p0ukuqpkhdgm800xksw7e2w'
const V2_ORDER_SCRIPT_HASH = 'script1c03gcdkrg3e3twj62menmf4xmhqhwz58d2xe7r9n497yc6r9qhd'
const STABLEPOOL_USDMUSDA = 'addr1wywdvw0qwv2n97e8y5jsfqq3qryu6re3gxwqcc7fzscpwugxz5dwe'
const STABLEPOOL_USDMDJED = 'addr1wxxdvtj6y4fut4tmu796qpvy2xujtd836yg69ahat3e6jjcelrf94'
const STABLEPOOL_USDMIUSD = 'addr1w9520fyp6g3pjwd0ymfy4v2xka54ek6ulv4h8vce54zfyfcm2m0sm'
const STABLEPOOL_USDCIUSD = 'addr1wx4w03kq5tfhaad2fmglefgejj0anajcsvvg88w96lrmylc7mx5rm'
const STABLEPOOL_DJEDIUSD = 'addr1wy7kkcpuf39tusnnyga5t2zcul65dwx9yqzg7sep3cjscesx2q5m5'
const STABLEPOOL_USDCDJED = 'addr1wx8d45xlfrlxd7tctve8xgdtk59j849n00zz2pgyvv47t8sxa6t53'
const STABLEPOOL_IUSDUSDA = 'addr1wyge54qpez2zc250f8frwtksjzrg4l6n5cs34psqas9uz0syae9sf'
const CONTRACT_ADDRESSES = [V1_POOL_SCRIPT_HASH, V1_ORDER_SCRIPT_HASH, V2_POOL_SCRIPT_HASH, V2_ORDER_SCRIPT_HASH, STABLEPOOL_USDMUSDA, STABLEPOOL_USDMDJED, STABLEPOOL_USDMIUSD, STABLEPOOL_USDCIUSD, STABLEPOOL_DJEDIUSD, STABLEPOOL_USDCDJED, STABLEPOOL_IUSDUSDA]

async function tvl() {
  const assetsLocked = await sumTokens2({
    owners: CONTRACT_ADDRESSES
  })
  return assetsLocked
}

async function stake() {
  const assetsStaked = await sumTokens2({
    owner: 'addr1wy3fscaws62d59k6qqhg3xsarx7vstzczgjmdhx2jh7knksj7w3y7',
    tokens: ['29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e']
  })
  return assetsStaked
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
    staking: stake
  },
  hallmarks: [
    [1647949370, "Vulnerability Found"],
    [1712565661, "Stableswap Launch"],
    [1720584000, "V2 Launch"]
  ],
};
