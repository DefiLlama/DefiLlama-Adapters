const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryContractsBSC = [
  "0x169169a50d9a8fbf99edacf9aa10297e2b3c92dd"
];

module.exports = treasuryExports({
  ethereum: {
    tokens: [nullAddress,],
    owners: [
      '0x6f0bc6217faa5a2f503c057ee6964b756a09ae2c',
      '0xcb0718b150552af8904e7cb1c62758dcb149b072',
    ],
  },
  bsc: {
    tokens: [nullAddress,],
    owners: treasuryContractsBSC,
    ownTokenOwners: treasuryContractsBSC,
    ownTokens: ['0x7ad7242a99f21aa543f9650a56d141c57e4f6081'],
  },
  avax: {
    tokens: [nullAddress,],
    owners: [
      "0xaeA6B4AAd5e315a40aFD77a1F794F61161499Fa5"
    ],
  },
  optimism: {
    tokens: [nullAddress,],
    owners: [
      "0x489f866c0698C8D6879f5C0F527bc8281046042D"
    ],
  },
  arbitrum: {
    tokens: [nullAddress,],
    owners: [
      '0x02944e3fb72aa13095d7cebd8389fc74bec8e48e',
      '0xd012A9C8159b0E7325448eD30B1499FddDAc0F40',
    ],
  },
})