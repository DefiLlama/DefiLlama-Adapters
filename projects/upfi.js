const { get } = require('./helper/http')

async function pool2() {
  const response = await get("https://api.upfi.network/tvl")
  return { 
    'upfi-network': response.UPS_USDC,
    'usd-coin': response.USDC_UPFI + response.UPFI_3Pool,
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL data is pulled from the UPFI API "https://api.upfi.network/tvl".',
  solana: {
    tvl: async ()=> ({}),
    pool2,
  }
};
