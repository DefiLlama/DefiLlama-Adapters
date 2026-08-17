const { sumTokens2 } = require('../helper/unwrapLPs');

// All 21 EVM Sovereign Authority Clusters + Executive Nodes
const EVM_WALLETS = [
  '0x41530960555eb375d31505c866f773950cf60408',
  '0xa582098679cb0886ff0189a7147e62a86241a27e',
  '0xa1bd758406c57fba3e18cfab8cb9dccead234399',
  '0x1c8b368f58c70ff61b8fbf020fa4995f57c6b976',
  '0xa660705a61044436577884d5dfd9b3fe193e2fd3',
  '0x02830f3050c2656911ebec92f801caebc17fb1d0',
  '0x3C9718a88C31D397c494A51Dbec614afB77ddBB2',
  '0x53208f405281cae9ce059b2e9669d23412c0e2b3',
  '0xdd5039bb6c28da062f351c5025873d6bbeeb0415',
  '0xfa6443c5b8b9a2b53ebca4a1ebfe539be2fa26ce',
  '0x9c3cf0e81c15f9227653bbdf1c454e92a2a0937c',
  '0x8797f1f9640989fa78fcff39a8c0879577777085',
  '0x42f790ce7be85e135ceba8903c7340b9911e03c4',
  '0x3c2efd02a75905d43899f8daeeeaeb5ec8db2778',
  '0x40cb8f7d9ff9b8c084fca8dcf37fe81995cb4d37',
  '0x89ee18e268a2bf6cb8798bf13359d91f2bb0da9a',
  '0xeb553531b7454e7d9bcf69a4ea9e4beceea5fba1',
  '0x5ad48303f26e5792945d7be42b6a6bb4ccefa7d7',
  '0xcf953fa91a3297a78377da5642436d4df6c52a3a',
  '0x8c61bb62939886fa7f0ce98a88939c362fa7069b',
  '0xa58cfda28271e54911d7fc109a25bdfa4adabfe4'
];

// Solana Sovereign Settlement Endpoints
const SOLANA_WALLETS = [
  '7iTdfnBw4xGj14zZ737kLqKq4M37bXhZ9k5rTzVb2WbN',
  '3aBxK9qZ71mN8tF4vP6rY2sX1wE9dL0kH5gJ7cM3vQ1Z'
];

module.exports = {
  methodology: "Sums native gas tokens (ETH, SOL, BNB, POL) and contract assets ($1USD, USDC, USDT) across 21 EVM executive authority clusters and 2 Solana sovereign settlement endpoints with MEV-resilience and EIP-7702 delegation tracking.",
  timetravel: false,
  misrepresentedTokens: false,
  ethereum: {
    tvl: async (api) => {
      return sumTokens2({
        api,
        owners: EVM_WALLETS,
        fetchCoingeckoData: true,
      });
    }
  },
  solana: {
    tvl: async (api) => {
      return sumTokens2({
        api,
        owners: SOLANA_WALLETS,
        fetchCoingeckoData: true,
      });
    }
  }
};
