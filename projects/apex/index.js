const { sumTokensExport } = require('../helper/unwrapLPs')
const tokens = [
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
];

const owners = [
  '0xA1D5443F2FB80A5A55ac804C948B45ce4C52DCbb'
]
module.exports = {
  start: 15402867,
  ethereum: { tvl: sumTokensExport({ owners, tokens, }) },
  arbitrum: { tvl: () => 0 }
};
