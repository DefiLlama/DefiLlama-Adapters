const TRACKED_TOKENS = {
  aUSDC: '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB', // Aave USDC on Base
  aETH: '0xD4a0e0b9149BCee3C920d2E00b5dE09138fd8bb7'   // Aave ETH on Base
};

// ClubPool contract address
const CONTRACT_ADDRESS = '0x1089db83561d4c9b68350e1c292279817ac6c8da';

async function tvl(api) {
  const tokens = Object.values(TRACKED_TOKENS);
  
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: tokens.map(token => ({
      target: token,
      params: [CONTRACT_ADDRESS]
    }))
  });

  api.addTokens(
    tokens,
    balances
  );
}

module.exports = {
  methodology: "Measures TVL of Run Money by tracking aUSDC and aETH balances in the ClubPool contract.",
  start: 21942754, // Deployment block of ClubPool
  base: {
    tvl
  }
}; 