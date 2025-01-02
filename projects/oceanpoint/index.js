const { staking } = require('../helper/staking');

const CONTRACTS = [
  "0x13299657e662894b933Bb3Ee73F7f8dA94b55451",
  "0x1802f66868d0649687a7a6bc9b8a4292e148daec",
  "0x6f1e92fb8a685aaa0710bad194d7b1aa839f7f8a",
  "0x57ba886442d248C2E7a3a5826F2b183A22eCc73e"
];

const ERC20_TOKENS = [
  "0x509A38b7a1cC0dcd83Aa9d06214663D9eC7c7F4a"
];

module.exports = {
  ethereum: {
    tvl: () => ({}),
    pool2: staking(CONTRACTS, '0x0E85fB1be698E777F2185350b4A52E5eE8DF51A6'),
    staking: staking(CONTRACTS, ERC20_TOKENS),
  }
};
