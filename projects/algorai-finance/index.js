const { sumTokens } = require("../helper/chain/algorand");
const sdk = require('@defillama/sdk')

async function tvl() {
  return sumTokens({ owners: vaults, blacklistedTokens: borrowAssets.map(b => b.asset) })
}

async function borrowed() {
  const data = await sumTokens({ owners: vaults, tokens: borrowAssets.map(b => b.asset) })
  for (const b of borrowAssets) {
    const key = 'algorand:' + b.asset
    sdk.util.sumSingleBalance(data, b.replacement, data[key] ?? 0, 'algorand')
    delete data[key]
  }
  return data
}


const vaults = [
  // v1.0
  878144513,
  878140320,
  // v1.1
  919531421,
  919539218,
  1004309470,
  1004325987,
  1004326861,
  1004374058,
  1097368119,
  1146813039,
  1170260887,
  1170261298,
  1190994349,
  1255766337,
  1202846474,
  1190874303,
];

const borrowAssets = [
  { asset: '1145959061', replacement: '31566704', name: 'hUSDC' },
  { asset: '1145958888', replacement: '1', name: 'hAlgo' },
]

module.exports = {
  timetravel: false,
  algorand: {
    tvl, borrowed,
  },
};