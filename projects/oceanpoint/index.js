const { getLogs2 } = require('../helper/cache/getLogs');
const { staking } = require('../helper/staking');
const { sumTokens2 } = require('../helper/unwrapLPs');

const BST = '0x509A38b7a1cC0dcd83Aa9d06214663D9eC7c7F4a';
const BST_ETH_LP = '0x0E85fB1be698E777F2185350b4A52E5eE8DF51A6';
const GOVERNANCE_POOL = '0x6f1e92fb8a685aaa0710bad194d7b1aa839f7f8a';
const LIQUIDITY_STAKING = '0x1802f66868d0649687a7a6bc9b8a4292e148daec';
const MARKETPLACE_POOL_FACTORY = '0x17887106a14f38bf10512565bdbb5bd7ac12f001';

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: MARKETPLACE_POOL_FACTORY,
    fromBlock: 20148497,
    eventAbi:
      'event MarketplacePoolCreated(address indexed marketplacePoolAddress, address cpWallet, address bsWallet, string cpIdentifier, string cpUrl, string tokenName, string tokenSymbol)',
  });

  const poolAddresses = logs.map((l) => l.marketplacePoolAddress);

  await sumTokens2({
    api,
    owners: poolAddresses,
    tokens: [BST],
  });
}

module.exports = {
  methodology:
    'TVL tracks BST deposited in marketplace pools. Staking tracks BST in the governance pool. Pool2 tracks BST/ETH LP tokens in the liquidity staking pool.',
  ethereum: {
    tvl,
    staking: staking(GOVERNANCE_POOL, BST),
    pool2: staking(LIQUIDITY_STAKING, BST_ETH_LP),
  },
};
