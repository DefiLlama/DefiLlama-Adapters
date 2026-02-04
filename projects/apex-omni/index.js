const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = [
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.WBTC,
  ADDRESSES.null,
  ADDRESSES.ethereum.USDe,
  ADDRESSES.ethereum.WETH,
  ADDRESSES.ethereum.sUSDe,
  ADDRESSES.ethereum.cbBTC,
];

const walletAddresses = {
  bsc: ['0xb8d9f005654b7b127b34dae8f973ba729ca3a2d9'],
  ethereum: ['0x35D173cdfE4d484BC5985fDa55FABad5892c7B82'],
  arbitrum: ['0x3169844a120c0f517b4eb4a750c08d8518c8466a'],
  base: ['0xee7981c4642de8d19aed11da3bac59277dfd59d7'],
  mantle: ['0x3c7c0ebfcd5786ef48df5ed127cddeb806db976c']

};

const tokenAddress = {
  bsc: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC, ADDRESSES.null, ADDRESSES.bsc.USD1],
  arbitrum: [ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.null, ADDRESSES.arbitrum.WETH],
  base: [ADDRESSES.base.USDT, ADDRESSES.base.USDC, ADDRESSES.null, ADDRESSES.optimism.WETH_1, ADDRESSES.ethereum.cbBTC],
  mantle: [ADDRESSES.mantle.USDT, ADDRESSES.mantle.USDC, ADDRESSES.mantle.mETH, ADDRESSES.mantle.cmETH, ADDRESSES.mantle.FBTC, ADDRESSES.arbitrum.USDe, ADDRESSES.mantle.WETH, ADDRESSES.arbitrum.sUSDe]
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
