const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const walletAddresses = {
  eth: ['0xc0a1a1e4af873e9a37a0cac37f3ab81152432cc5', '0xfAaE2946e846133af314d1Df13684c89fA7d83DD', '0x74B97d2097D64b4D2A3317d4Bda2dAb88B80e7ab', '0xd22faE190736eFFc8ceB3d8845a5D33ae7805392'],
  bsc: ['0x0520b0a951658db92b8a2dd9f146bb8223638740'],
  arbitrum: ['0xceeed84620e5eb9ab1d6dfc316867d2cda332e41'],
};

const tokenAddress = {
  eth: [ADDRESSES.ethereum.USDT, '0x23878914efe38d27c4d67ab83ed1b93a74d4086a'],
  bsc: [ADDRESSES.bsc.USDT],
  arbitrum: [ADDRESSES.arbitrum.USDT],
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: walletAddresses.eth, tokens: tokenAddress.eth }),
  },
  bsc: {
    tvl: sumTokensExport({ owners: walletAddresses.bsc, tokens: tokenAddress.bsc }),
  },
  arbitrum: {
    tvl: sumTokensExport({ owners: walletAddresses.arbitrum, tokens: tokenAddress.arbitrum }),
  },
};
