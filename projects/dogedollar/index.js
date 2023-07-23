const DJED_ADDR = '0xA99ef299CdA10AC4Ec974370778fbd27Cfb5CF61'
const DOGEDOLLAR_ADDR = '0x21E89a9F9f114A1eED26Ac199c9EbfEc5120c346'
const WWDOGE_ADDR = '0xb7ddc6414bf4f5515b52d8bdd69973ae205ff101'

async function tvl(_, _1, _2, { api }) {

  // debt-based collateral in WDOGE
  const collateralBalance = await api.call({
    abi: 'function R(uint256 cpa) view returns (uint256 balance)',
    target: DJED_ADDR,
    params: [0],
  });
  api.add(WWDOGE_ADDR, collateralBalance)

  // stablecoin-based collateral
  const fallbackCoinAddr = await api.call({
    abi: 'function reserve() view returns (address)',
    target: DOGEDOLLAR_ADDR,
  });

  const fallbackCoinBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: fallbackCoinAddr,
    params: [DOGEDOLLAR_ADDR],
  });
  api.add(fallbackCoinAddr, fallbackCoinBalance)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'finds the DOGE balance of the DJED instance backing the stablecoin, aswell as the fallback stablecoin balance',
  start: 14576300,
  dogechain: {
    tvl,
  }
}; 
