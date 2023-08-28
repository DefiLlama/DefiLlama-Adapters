const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const tokens = [
  ADDRESSES.ethereum.USDC,
];

const owners = [
  '0xA1D5443F2FB80A5A55ac804C948B45ce4C52DCbb'
]
module.exports = {
  start: 15402867,
  ethereum: { tvl: sumTokensExport({ owners, tokens, }) },
  arbitrum: { tvl: () => 0 }
};
