// defillama-adapters/projects/dscswap/getPrice.js

const sdk = require('@defillama/sdk');

const chain = 'dscs'; // your custom chain slug (must be configured in DefiLlama)
const WDSC_USDT_LP = '0x50760591aFcC3F8E1CFe7d2E48a9993247A6E683';

const TOKENS = {
  WDSC: '0x660f38cC4068550a73909ff891a3898593360c89',
  USDT: '0x98696d607724C342652663bca2c6E836Bb010E0A',
};

async function getWDSCPrice() {
  try {
    const [reserves, token0] = await Promise.all([
      sdk.api.abi.call({
        target: WDSC_USDT_LP,
        abi: 'function getReserves() view returns (uint112,uint112,uint32)',
        chain,
      }),
      sdk.api.abi.call({
        target: WDSC_USDT_LP,
        abi: 'function token0() view returns (address)',
        chain,
      }),
    ]);

    const [reserve0, reserve1] = reserves.output;
    const token0Addr = token0.output.toLowerCase();
    console.log('Reserve0:', reserve0);
    console.log('Reserve1:', reserve1);

    let price;
    if (token0Addr === TOKENS.WDSC.toLowerCase()) {
      price = reserve1 / reserve0; // WDSC = token0, USDT = token1
    } else {
      price = reserve0 / reserve1; // WDSC = token1, USDT = token0
    }

    console.log(`💰 On-chain WDSC price (in USDT): ${price}`);
  } catch (err) {
    console.error("❌ Error fetching price:", err);
  }
}

getWDSCPrice();
