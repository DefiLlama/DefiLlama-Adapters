const AVBTC_ADDRESS = "0xfd2c2A98009d0cBed715882036e43d26C4289053";
const BTCB_ADDRESS = "0x152b9d0FdC40C096757F570A51E494bd4b943E50"

async function tvl(api) {
  
  // Get totalSupply from the contract
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: AVBTC_ADDRESS })
  
  // avBTC has 18 decimals while BTC.b has 8 -- adjust
  const btcAmount = totalSupply / (10 ** 10);
  
  api.add(BTCB_ADDRESS, btcAmount);
}

// Export the adapter
module.exports = {
  methodology: "Calculates TVL by querying the avBTC contract's totalSupply function",
  timetravel: false,
  avax: {
    tvl,
  }
};