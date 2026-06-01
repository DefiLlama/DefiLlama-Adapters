const { sumTokens2 } = require('../helper/unwrapLPs');

const CLAIM = '0x059D278233fEC14CB6D1A74E6FB482BC3f91ADbf';
const VE_CLAIM = '0x876Da22a5bBEe4f8963b791631D2cAC5199389eE';
const LP_STAKING_VAULT_7D = '0xafdbB422CF75D6f2C557BDD2EF955c518b086271';
const GENESIS_LP_VAULT_24M = '0x1532F33e53680f89d083a0bf5baedcCCD2E7267a';
const AERODROME_WETH_CLAIM_POOL = '0x7274599ec9DBf15D474A6FB18aA285aE001d87Aa';

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [[CLAIM, VE_CLAIM]],
  });
}

async function pool2(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [AERODROME_WETH_CLAIM_POOL, LP_STAKING_VAULT_7D],
      [AERODROME_WETH_CLAIM_POOL, GENESIS_LP_VAULT_24M],
    ],
    resolveLP: true,
  });
}

module.exports = {
  methodology:
    'TVL = CLAIM principal locked in VeClaimNFT (voting-escrow ERC-721, max 1-year linear-decay locks). veCLAIM holders receive a pro-rata share of ETH royalties from every Mine takeover (25% of each takeover ETH flows to lockers, weighted by veCLAIM share). This is the productive long-term-locked, ETH-yield-bearing position and the correct denominator for the protocol\'s ETH-royalty APR. Pool2 = Aerodrome v2 vAMM WETH/CLAIM LP tokens custodied by LpStakingVault7D (7-day rolling stake for active LP stakers) and GenesisLPVault24M (24-month time-locked genesis seed liquidity). LP positions earn CLAIM emissions (token issuance) rather than ETH royalties, so they are reported under pool2 (protocol-native LP) per DefiLlama convention. LP tokens are unwrapped into their underlying WETH and CLAIM reserves.',
  base: {
    tvl,
    pool2,
  },
};
