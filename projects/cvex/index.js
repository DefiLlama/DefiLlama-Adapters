const USDC_TOKEN = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'; // USDC Token Address
const MAIN_CONTRACT = '0xBe14D34ce8737614331cE1904AA659E26657eE85'; // Main Contract Address (Proxy)

async function tvl(api) {
  const usdcBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: USDC_TOKEN,
    params: [MAIN_CONTRACT],
  });

  api.add(USDC_TOKEN, usdcBalance);
}

module.exports = {
  methodology: 'counts the USDC balance in the main contract on Arbitrum.',
  start: 292972866, // Replace with the actual start block for Arbitrum
  arbitrum: {
    tvl,
  },
};
