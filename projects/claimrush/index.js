const { sumTokens2 } = require('../helper/unwrapLPs');
const { staking } = require('../helper/staking');

const CLAIM = '0x059D278233fEC14CB6D1A74E6FB482BC3f91ADbf';
const VE_CLAIM = '0x876Da22a5bBEe4f8963b791631D2cAC5199389eE';
const LP_STAKING_VAULT_7D = '0xafdbB422CF75D6f2C557BDD2EF955c518b086271';
const GENESIS_LP_VAULT_24M = '0x1532F33e53680f89d083a0bf5baedcCCD2E7267a';
const AERODROME_WETH_CLAIM_POOL = '0x7274599ec9DBf15D474A6FB18aA285aE001d87Aa';

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
    'Pool2 = Aerodrome v2 vAMM WETH/CLAIM LP tokens custodied by LpStakingVault7D (7-day rolling staking position for active stakers) plus GenesisLPVault24M (24-month time-locked genesis seed liquidity). LP tokens are unwrapped into their underlying WETH and CLAIM reserves. Staking bucket = CLAIM principal locked in VeClaimNFT (voting-escrow NFT, max 1-year linear-decay locks) to receive a pro-rata share of ETH royalties from every Mine takeover.',
  base: {
    tvl: () => ({}),
    pool2,
    staking: staking(VE_CLAIM, CLAIM),
  },
};
