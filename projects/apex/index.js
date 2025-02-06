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
  "0x96866592ccc2c5950CEE1Ca83685879DB0726150", //NEW
  "0x698192C9F0996eEa12B492d6806A98d2Fa928658"  // new usdc
];

const walletAddresses = {
  bsc: ['0x09b783ae2443147c23a114a43b25b05b701ee401', '0x78f1354EC30a634C8ebdB503381B1db9D18e872D'],
  polygon: ['0x10434755CFdCd34539dB91c81AB0e07F96D44AA7', '0xddfd32b73212ED7854095112a53D9BDd53F0355F'],
  arbitrum: ['0x0206d250f233c124c2dd5fa7d275c560cb034a37', '0x367a1cB550D2C8B235Ba0dab9b7FE6B6085263Cf'],
  avax: ['0x2fd7d4A45f80b1d22d1eBb7B3b2961D131eB0A22', '0xE33Bb824B1018b78b4B22eB2c08400515f32D5a1'],
  optimism: ['0x89cBccEdDF07A14aFf90eF5D3A7D5BEf9e33Cb6b', '0x792BFFe24A7c426aEA9E15E051f490B6b77899dc'],
  mantle: ['0x3a4d747D381D401E598CAFE65D4a70a704988c50', '0x9f0828611b642777569948E1FB22AD6340Bf8b07'],
};

const tokenAddress = {
  bsc: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC],
  polygon: [ADDRESSES.polygon.USDC_CIRCLE, ADDRESSES.polygon.USDC],
  arbitrum: [ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE],
  avax: ADDRESSES.avax.USDC,
  optimism: ADDRESSES.optimism.USDC_CIRCLE,
  mantle: ADDRESSES.mantle.USDC,
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners, tokens }),
  },
  bsc: {
    tvl: sumTokensExport({ owners: walletAddresses.bsc, tokens: tokenAddress.bsc }),
  },
  polygon: {
    tvl: sumTokensExport({ owners: walletAddresses.polygon, tokens: tokenAddress.polygon }),
  },
  arbitrum: {
    tvl: sumTokensExport({ owners: walletAddresses.arbitrum, tokens: tokenAddress.arbitrum }),
  },
  avax: {
    tvl: sumTokensExport({ owners: walletAddresses.avax, tokens: [tokenAddress.avax] }),
  },
  optimism: {
    tvl: sumTokensExport({ owners: walletAddresses.optimism, tokens: [tokenAddress.optimism] }),
  },
  mantle: {
    tvl: sumTokensExport({ owners: walletAddresses.mantle, tokens: [tokenAddress.mantle] }),
  },
};
