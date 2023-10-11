const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = [
  ADDRESSES.ethereum.USDC,
];

const owners = [
  '0xA1D5443F2FB80A5A55ac804C948B45ce4C52DCbb',
  '0xe95b3Dc78c0881dEa17A69BaFC6cFeB8d891e9DE',
];

const walletAddresses = {
  bsc: '0xe29304Af265641a49F55294F7E5BA5010ebA4497',
  polygon: '0x10434755CFdCd34539dB91c81AB0e07F96D44AA7',
  arbitrum: '0x7B55800de02e4799F7b00a2C9963575464053F6A',
  avax: '0x2fd7d4A45f80b1d22d1eBb7B3b2961D131eB0A22',
  optimism: '0x89cBccEdDF07A14aFf90eF5D3A7D5BEf9e33Cb6b',
  mantle: '0x3a4d747D381D401E598CAFE65D4a70a704988c50',
};

const tokenAddress = {
  bsc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  arbitrum: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
  avax: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  optimism: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
  mantle: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9',
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners, tokens }),
  },
  bsc: {
    tvl: sumTokensExport({ owners: [walletAddresses.bsc], tokens: [tokenAddress.bsc] }),
  },
  polygon: {
    tvl: sumTokensExport({ owners: [walletAddresses.polygon], tokens: [tokenAddress.polygon] }),
  },
  arbitrum: {
    tvl: sumTokensExport({ owners: [walletAddresses.arbitrum], tokens: [tokenAddress.arbitrum] }),
  },
  avax: {
    tvl: sumTokensExport({ owners: [walletAddresses.avax], tokens: [tokenAddress.avax] }),
  },
  optimism: {
    tvl: sumTokensExport({ owners: [walletAddresses.optimism], tokens: [tokenAddress.optimism] }),
  },
  mantle: {
    tvl: sumTokensExport({ owners: [walletAddresses.mantle], tokens: [tokenAddress.mantle] }),
  },
};
