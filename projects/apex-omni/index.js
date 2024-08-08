const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = [
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
];

const walletAddresses = {
  bsc: ['0xb8d9f005654b7b127b34dae8f973ba729ca3a2d9'],
  ethereum: ['0x35D173cdfE4d484BC5985fDa55FABad5892c7B82'],
  arbitrum: ['0x3169844a120c0f517b4eb4a750c08d8518c8466a'],
  base: ['0xee7981c4642de8d19aed11da3bac59277dfd59d7'],
  mantle: ['0x3c7c0ebfcd5786ef48df5ed127cddeb806db976c']

};

const tokenAddress = {
  bsc: [ADDRESSES.bsc.USDT],
  arbitrum: [ADDRESSES.arbitrum.USDT],
  base: ['0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'],
  mantle: [ADDRESSES.mantle.USDT]
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
  base: {
    tvl: sumTokensExport({ owners: walletAddresses.base, tokens: tokenAddress.base }),
  },
  mantle: {
    tvl: sumTokensExport({ owners: walletAddresses.mantle, tokens: tokenAddress.mantle }),
  },
};