const BOW_TOKEN      = '0x507B757cf2157f6357DC385b8096d7daFAefDaAA';
const BOW_RANGE      = '0x7323e2B2B9cafdceE28DD57Eaf7357F0D19d8e57';
const SHERIFFS_PURSE = '0x3230b8F6fF97366E9ccD3BDaD5F57C6Def569D10';
const GROWTH_FUND    = '0xDD4799dfB8E345734ec8e801eCDBaF551360C3e7';
const AUTO_MINE_VAULT = '0xc4BC321B0a9059D413c77E2306905166Fe3F83ea';
const BOW_VOTE_ESCROW = '0xD3287B613FdB7a735221C7851c37475C22583621';
const BOW_LP_STAKING  = '0x807C8fA32F44D4d38865a76443d4D1D49A5F3BA1';
const LP_TOKEN        = '0x0555921631F8A2f3b900178b2F02D70353396F7F'; // BOW/WETH pair, via BowLPStaking.lpToken()

async function tvl(api) {
  for (const addr of [BOW_RANGE, SHERIFFS_PURSE, GROWTH_FUND, AUTO_MINE_VAULT]) {
    const bal = await api.getBalance(addr);
    api.addGasToken(bal);
  }
}

async function staking(api) {
  const lockedBow = await api.call({ abi: 'erc20:balanceOf', target: BOW_TOKEN, params: [BOW_VOTE_ESCROW] });
  api.add(BOW_TOKEN, lockedBow);
}

async function pool2(api) {
  const stakedLp = await api.call({ abi: 'erc20:balanceOf', target: LP_TOKEN, params: [BOW_LP_STAKING] });
  api.add(LP_TOKEN, stakedLp);
}

module.exports = {
  methodology: 'TVL sums the native ETH held by the BowStop game contracts on behalf of users: live volley pots and carryover (BowRange), the unclaimed Sheriff\'s Purse prize pool (SheriffsPurse), undistributed growth-fund revenue (GrowthFund), and auto-mine deposits (AutoMineVault). Staking counts BOW locked into permanent veBOW positions (BowVoteEscrow). Pool2 counts BOW/WETH LP staked in BowLPStaking.',
  robinhood: {
    tvl,
    staking,
    pool2,
  },
};
