const { get } = require('../helper/http')

const USDC_CONTRACT_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const OLAB_METRICS_URL = 'https://api.olab.xyz/api/v2/statistics';

async function tvl(api) {
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
    }
  };
  const data = await get(OLAB_METRICS_URL, options);
  const {result: {totalDeposit}} = data;
  const tvl = totalDeposit*10**6;
  api.add(USDC_CONTRACT_BASE, tvl)
}

module.exports = {
  methodology: 'TVL (Total Value Locked) refers to the total amount of USDC held in the platform',
  start: 23899060,
  base: {
    tvl,
  }
};