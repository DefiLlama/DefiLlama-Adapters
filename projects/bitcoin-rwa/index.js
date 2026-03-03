const PBTC_TOKEN = '0x427Bb443F2fDa1EF25e261f007662ecab54644Ac';
const CLEARPOOL_VAULT = '0x1d16a9431a3318423b2c896b42d589a06f070413';
const WBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

async function tvl(api) {
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: PBTC_TOKEN,
    params: [CLEARPOOL_VAULT],
  });

  const wbtcEquivalent = BigInt(balance) / BigInt(1e10);
  api.add(WBTC, wbtcEquivalent.toString());
}

module.exports = {
  methodology: 'TVL is calculated as the total pBTC deposited in the Protos pBTC RWA vault on Clearpool. pBTC is backed 1:1 by BTC held in qualified custody with Proof of Reserve verification.',
  misrepresentedTokens: true,
  ethereum: {
    tvl,
  }
};