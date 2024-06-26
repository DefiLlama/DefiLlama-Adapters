const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = [
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
];

const walletAddresses = {
  bsc: ['0xb8d9f005654b7b127b34dae8f973ba729ca3a2d9'],
  ethereum: ['0x35D173cdfE4d484BC5985fDa55FABad5892c7B82'],
  arbitrum: ['0x3169844a120c0f517b4eb4a750c08d8518c8466a']

};

const tokenAddress = {
  bsc: [ADDRESSES.bsc.USDT],
  arbitrum: [ADDRESSES.arbitrum.USDT],
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: walletAddresses.ethereum, tokens }),
  },
  bsc: {
    tvl: sumTokensExport({ owners: walletAddresses.bsc, tokens: tokenAddress.bsc }),
  },
  arbitrum: {
    tvl: sumTokensExport({ owners: walletAddresses.arbitrum, tokens: tokenAddress.arbitrum }),
  },
};