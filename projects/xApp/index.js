const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');

// Staking contracts where users stake LP tokens
const STAKING_CONTRACTS = [
  "0x96500a433E0b67B3438cf01677E38c9EFDeF4a56", // Replace with actual address
  "0xBA9826C84304118bd444EFC6980753aA8083b4A4" // Replace with actual address
];

// LP tokens being staked (Uniswap V2 forks)
const LP_TOKENS = [
  "0x90b71b077BD5b7Ae47a19153Cd8E7BB5b8077E80", // XUSD/XFI
  "0xae5BcC1Ef83CC3d3a8f69E9eB5380458eDbC1788" // XUSD/USDC
];

// Important token addresses
const TOKENS = {
  XUSD: {
    address: "0x8BD5Fe9286B039cc38d9B63865a8E87736382CCF",
    decimals: 18,
    price: 1 // Pegged to USD
  },
  XFI: {
    address: "0x2E881B39a8c84b56EC683D5D77Cec9A1Ef82063E", // WXFI address
    decimals: 18, 
    // XFI price will be determined by DeFi Llama's price oracle
  },
  USDC: {
    address: "0x7bBcE15166bBc008EC1aDF9b3D6bbA0602FCE7Ba",
    decimals: 6,
    price: 1 // Pegged to USD
  }
};

// Uniswap V2 compatible ABIs
const getReservesABI = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)';
const token0ABI = 'function token0() view returns (address)';
const token1ABI = 'function token1() view returns (address)';
const totalSupplyABI = 'function totalSupply() view returns (uint256)';
const balanceOfABI = 'function balanceOf(address) view returns (uint256)';
const decimalsABI = 'function decimals() view returns (uint8)';

async function tvl(timestamp, block, chainBlocks, { api }) {
  const balances = {};
  
  // For each LP token and staking contract pair
  for (let i = 0; i < Math.min(STAKING_CONTRACTS.length, LP_TOKENS.length); i++) {
    const lpToken = LP_TOKENS[i];
    const stakingContract = STAKING_CONTRACTS[i];
    
    // Get the amount of LP tokens staked
    const stakedLPAmount = await api.call({
      target: lpToken,
      abi: balanceOfABI,
      params: [stakingContract]
    });
    
    if (stakedLPAmount === '0') continue;
    
    // Get LP token data
    const [totalSupply, token0, token1, reserves] = await Promise.all([
      api.call({ target: lpToken, abi: totalSupplyABI }),
      api.call({ target: lpToken, abi: token0ABI }),
      api.call({ target: lpToken, abi: token1ABI }),
      api.call({ target: lpToken, abi: getReservesABI })
    ]);
    
    // Get token decimals
    const [decimals0, decimals1] = await Promise.all([
      api.call({ target: token0, abi: decimalsABI }).catch(() => 18), // Default to 18 if call fails
      api.call({ target: token1, abi: decimalsABI }).catch(() => 18)  // Default to 18 if call fails
    ]);
    
    console.log(`LP Token ${lpToken} - Token0: ${token0} (${decimals0} decimals), Token1: ${token1} (${decimals1} decimals)`);
    
    // Calculate the portion of reserves that belongs to staked LP tokens
    const stakedRatio = BigInt(stakedLPAmount) * BigInt(10**18) / BigInt(totalSupply);
    
    // Add the tokens to balances with proper decimal handling
    const reserve0 = BigInt(reserves._reserve0.toString());
    const reserve1 = BigInt(reserves._reserve1.toString());
    
    const amount0 = (reserve0 * stakedRatio / BigInt(10**18)).toString();
    const amount1 = (reserve1 * stakedRatio / BigInt(10**18)).toString();
    
    // Identify tokens in the pair to add proper price handling
    const token0IsXUSD = token0.toLowerCase() === TOKENS.XUSD.address.toLowerCase();
    const token1IsXUSD = token1.toLowerCase() === TOKENS.XUSD.address.toLowerCase();
    const token0IsXFI = token0.toLowerCase() === TOKENS.XFI.address.toLowerCase();
    const token1IsXFI = token1.toLowerCase() === TOKENS.XFI.address.toLowerCase();
    const token0IsUSDC = token0.toLowerCase() === TOKENS.USDC.address.toLowerCase();
    const token1IsUSDC = token1.toLowerCase() === TOKENS.USDC.address.toLowerCase();
    
    // Log pair information
    if (token0IsXUSD || token1IsXUSD) {
      console.log(`Pair includes XUSD (stablecoin pegged to 1 USD)`);
    }
    if (token0IsUSDC || token1IsUSDC) {
      console.log(`Pair includes USDC (stablecoin pegged to 1 USD)`);
    }
    
    // Add tokens to balances with appropriate chain prefixes
    sdk.util.sumSingleBalance(balances, `crossfi:${token0}`, amount0);
    sdk.util.sumSingleBalance(balances, `crossfi:${token1}`, amount1);
    
    console.log(`Added ${amount0 / (10**decimals0)} of token0 and ${amount1 / (10**decimals1)} of token1 to balances`);
  }
  
  return balances;
}

// Alternative simplified approach using sumTokens2 with resolveLP=true
async function tvlAlt(timestamp, block, chainBlocks) {
  return sumTokens2({
    tokensAndOwners: LP_TOKENS.map((token, i) => [token, STAKING_CONTRACTS[i]]),
    chain: 'crossfi',
    block: chainBlocks['crossfi'],
    resolveLP: true,
    useDefaultCoreAssets: true,
  });
}

module.exports = {
  methodology: `TVL consists of LP tokens staked in the staking contracts. LP tokens are valued based on their underlying token reserves. The LP pairs include:
    - XUSD/XFI: XUSD is valued at 1 USD, XFI is priced via external price feeds
    - XUSD/USDC: Both are stablecoins pegged to 1 USD`,
  crossfi: {
    tvl,
    // Uncomment the line below to try the alternative approach if the main one doesn't work
    // tvl: tvlAlt,
  },
  timetravel: false,
};
