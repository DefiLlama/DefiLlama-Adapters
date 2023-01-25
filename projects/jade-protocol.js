const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryContracts = [
    '0x6f0bc6217faa5a2f503c057ee6964b756a09ae2c',
    '0xcb0718b150552af8904e7cb1c62758dcb149b072',
];
const treasuryContractsBSC = [
  "0x169169a50d9a8fbf99edacf9aa10297e2b3c92dd"
];
const treasuryContractsOP = [
    "0x489f866c0698C8D6879f5C0F527bc8281046042D"
];
const treasuryContractsARB = [
    '0x02944e3fb72aa13095d7cebd8389fc74bec8e48e',
    '0xd012A9C8159b0E7325448eD30B1499FddDAc0F40',
];
const treasuryContractsAVAX = [
    "0xaeA6B4AAd5e315a40aFD77a1F794F61161499Fa5"
];

module.exports = treasuryExports({
tvl: () => 0,
  ethereum: {
    tokens: [ nullAddress, ],
    owners: treasuryContracts,
    ownTokenOwners: treasuryContracts,
    ownTokens: null,
  },
  bsc: {
    tokens: [ nullAddress, ],
    owners: treasuryContractsBSC,
    ownTokenOwners: treasuryContractsBSC,
    ownTokens: ['0x7ad7242a99f21aa543f9650a56d141c57e4f6081'],
  },
  avax: {
    tokens: [ nullAddress, ],
    owners: treasuryContractsAVAX,
    ownTokenOwners: treasuryContracts,
    ownTokens: null,
  },
  optimism: {
    tokens: [ nullAddress, ],
    owners: treasuryContractsOP,
    ownTokenOwners: treasuryContracts,
    ownTokens: null,
  },
  arbitrum: {
    tokens: [ nullAddress, ],
    owners: treasuryContractsARB,
    ownTokenOwners: treasuryContracts,
    ownTokens: null,
  },
})