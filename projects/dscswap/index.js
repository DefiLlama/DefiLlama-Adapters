const { getUniTVL } = require('../helper/unknownTokens');
const sdk = require('@defillama/sdk');

const factory = "0x4Cff727C2f7F5956B4211Ac4ED64d30B2453D8Eb";
const chain = "dscs";
const WDSC_USDT_LP = '0x50760591aFcC3F8E1CFe7d2E48a9993247A6E683';
const TOKENS = {
  WDSC: '0x660f38cc4068550a73909ff891a3898593360c89',
  USDT: '0x98696d607724c342652663bca2c6e836bb010e0a',
};

// Optional — log live price for reference
async function getWDSCPrice(api) {
  const reserves = await api.call({
    target: WDSC_USDT_LP,
    abi: 'function getReserves() view returns (uint112,uint112,uint32)',
  });
  const token0 = await api.call({ target: WDSC_USDT_LP, abi: 'function token0() view returns (address)' });
  const [reserve0, reserve1] = [Number(reserves[0]), Number(reserves[1])];
  const token0Addr = token0.toLowerCase();
  const price = token0Addr === TOKENS.WDSC.toLowerCase() ? reserve1 / reserve0 : reserve0 / reserve1;
  console.log(`💰 Live WDSC Price: ${price}`);
  return price;
}

async function tvl(api) {
  const balances = await getUniTVL({
    factory,
    useDefaultCoreAssets: true,
    chain,
  })(api);

  const wdscPrice = await getWDSCPrice(api);

  // Convert balances into USD value
  const wdscBalance = Number(balances[`dscs:${TOKENS.WDSC}`] || 0) / 1e18;
  const usdtBalance = Number(balances[`dscs:${TOKENS.USDT}`] || 0) / 1e18;
  console.log(`WDSC Balance: ${wdscBalance*wdscPrice}, USDT Balance: ${usdtBalance}`);

  const totalUSD = (wdscBalance*wdscPrice) + (usdtBalance);

  console.log(`💰 TVL (USD): $${totalUSD.toLocaleString()}`);

  return {
    // usdTokenBalances: {
    //   [TOKENS.WDSC]: wdscBalance * wdscPrice,
    //   [TOKENS.USDT]: usdtBalance,
    // },
    usd: totalUSD,
  };
}


module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL counts all DSCswap pools.",
  dscs: { tvl },
};