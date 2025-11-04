const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = [
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  "0x0000000000000000000000000000000000000000",
  "0x4c9edd5852cd905f086c759e8383e09bff1e68b3",
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497",
  "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
];

const walletAddresses = {
  bsc: ['0xb8d9f005654b7b127b34dae8f973ba729ca3a2d9'],
  ethereum: ['0x35D173cdfE4d484BC5985fDa55FABad5892c7B82'],
  arbitrum: ['0x3169844a120c0f517b4eb4a750c08d8518c8466a'],
  base: ['0xee7981c4642de8d19aed11da3bac59277dfd59d7'],
  mantle: ['0x3c7c0ebfcd5786ef48df5ed127cddeb806db976c']

};

const tokenAddress = {
  bsc: ["0x55d398326f99059ff775485246999027b3197955", "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", "0x0000000000000000000000000000000000000000", "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d"],
  arbitrum: ["0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", "0x0000000000000000000000000000000000000000", "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"],
  base: ["0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", "0x0000000000000000000000000000000000000000", "0x4200000000000000000000000000000000000006", "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf"],
  mantle: ["0x201eba5cc46d216ce6dc03f6a759e8e766e956ae", "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9", "0xcDA86A272531e8640cD7F1a92c01839911B90bb0", "0xE6829d9a7eE3040e1276Fa75293Bde931859e8fA", "0xC96dE26018A54D51c097160568752c4E3BD6C364", "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34", "0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111", "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2"]
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
