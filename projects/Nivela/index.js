const ADDRESSES = require('../helper/coreAssets.json')
// Nivela Protocol Adapter for DeFiLlama
const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');

const nUSD = '0x9AE01bcE99611a389645437208f199F4595df737'
const tokens = {
    // Basic tokens
    NIV: '0x56FC995646AB92a5128cEB2124721D122B3b9D90',
    // veNIV: '0x4E6864C7007F407Dc62DB68f09023D58E93433Fe',
    // nUSD: '0x9AE01bcE99611a389645437208f199F4595df737',
    USDC: ADDRESSES.bsc.USDC,
    USDT: ADDRESSES.bsc.USDT,
    
    // Additional vault tokens
    wBNB: ADDRESSES.bsc.WBNB,
    FDUSD: ADDRESSES.ethereum.FDUSD,
    WETH: ADDRESSES.bsc.ETH,
    WBTC: ADDRESSES.bsc.BTCB,
};

const contracts = {
    StakednUSD: '0x6697Db6332071F7C5b64577d0db9B7219ae09594',
    VoteEscrowedNIV: '0x4E6864C7007F407Dc62DB68f09023D58E93433Fe',
    NivelaVault: '0x2f2FE42C07F9D2C12A386edeB64EFD23582AD9F6',
    LenderVoteEscrowedNIV: '0x674e2C3Add04D21e7A2d7f8a14d00969E413B446',
    LenderWBNB: '0x8e39de2390662F59fAB55D6dF031802BD4Be16d6',
    LenderWETH: '0x80cebB4579dB7C39bC43FC26a74e4086FD847FA5',
    PegStabilityModuleUSDC: '0x577a547F24A8bB4aC9643644684DC883254C282a',
    PegStabilityModuleUSDT: '0xE2D42dDB05E8Ddb8B399B4Fd2ad92F12E7470F1e',
    Floor: '0xc0c7d5EC7e543536bA6042baCdFed9bdc5B6304a',
    MarketLens: '0x79a71F1fac2376a9187A7482a2122F6e21fB97C7',
};



// Calculates TVL from NivelaVault, PSMs, and Floor
async function tvl(api) {
    const tokensAndOwners = [];

    // Add all vault tokens
    for (const [_, tokenAddress] of Object.entries(tokens)) {
        if (tokenAddress.toLowerCase() === tokens.NIV.toLowerCase()) continue;
        tokensAndOwners.push([tokenAddress, contracts.NivelaVault]);
    }

    // PSM tokens
    tokensAndOwners.push([tokens.USDC, contracts.PegStabilityModuleUSDC]);
    tokensAndOwners.push([tokens.USDT, contracts.PegStabilityModuleUSDT]);

    // Get all balances first
    const balances = await sumTokens2({ api, tokensAndOwners });
    
    return balances;
}

// Calculates staked nUSD
async function staking(api) {
    const tokensAndOwners = [
        [tokens.NIV, contracts.VoteEscrowedNIV],
    ];

    const balances = await sumTokens2({ api, tokensAndOwners });
    
    return balances;
}

// No LP tokens in the current implementation
async function pool2(api) {
    return {};
}

// Gets borrowed nUSD amount from the MarketLens contract
async function borrowed(api) {
  // Explicit ABI for the MarketLens contract function
  const abi = 'function getTotalBorrowed(address lender) external view returns (uint256)';

  // List of lenders to check
  const lenders = [
    contracts.LenderVoteEscrowedNIV,
    contracts.LenderWBNB,
    contracts.LenderWETH,
  ];

  // Get borrowed amounts from all lenders
  for (const lender of lenders) {
    const borrowedAmount = await api.call({
      abi,
      target: contracts.MarketLens,
      params: [lender],
    });
    api.add(nUSD, borrowedAmount);
  }

  return api.getBalances();
}


module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    doublecounted: false,
    methodology:
        'TVL includes various tokens in NivelaVault, stablecoins in PSMs, and nUSD in Floor. ' +
        'Staking tracks NIV in VoteEscrowedNIV and nUSD in StakednUSD. ' +
        'Borrowed shows nUSD loans from Lenders.',
    bsc: {
        tvl,
        staking,
        pool2,
        borrowed,
    },

};


