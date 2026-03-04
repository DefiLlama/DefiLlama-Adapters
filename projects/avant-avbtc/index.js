const AVBTC_ADDRESS = "0xfd2c2A98009d0cBed715882036e43d26C4289053";

async function tvl(api) {
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: AVBTC_ADDRESS })
  api.add(AVBTC_ADDRESS, totalSupply);
}

// Export the adapter
module.exports = {
  methodology: "Calculates TVL by querying the avBTC contract's totalSupply function",
  timetravel: true,
  doublecounted: true,
  avax: {
    tvl,
  }
};