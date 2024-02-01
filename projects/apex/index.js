const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = [
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
];

const owners = [
  '0xA1D5443F2FB80A5A55ac804C948B45ce4C52DCbb',
  '0xe95b3Dc78c0881dEa17A69BaFC6cFeB8d891e9DE',
  "0xe53A6eD882Eb3f90cCe0390DDB04c876C5482E6b",
  "0x96866592ccc2c5950CEE1Ca83685879DB0726150" //NEW
];

const walletAddresses = {
  bsc: '0x09b783ae2443147c23a114a43b25b05b701ee401',
  polygon: '0x10434755CFdCd34539dB91c81AB0e07F96D44AA7',
  arbitrum: '0x0206d250f233c124c2dd5fa7d275c560cb034a37',
  avax: '0x2fd7d4A45f80b1d22d1eBb7B3b2961D131eB0A22',
  optimism: '0x89cBccEdDF07A14aFf90eF5D3A7D5BEf9e33Cb6b',
  mantle: '0x3a4d747D381D401E598CAFE65D4a70a704988c50',
};

const tokenAddress = {
  bsc: ADDRESSES.bsc.USDT,
  polygon: ADDRESSES.polygon.USDC_CIRCLE,
  arbitrum: ADDRESSES.arbitrum.USDT,
  avax: ADDRESSES.avax.USDC,
  optimism: ADDRESSES.optimism.USDC_CIRCLE,
  mantle: ADDRESSES.mantle.USDC,
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
