const Web3 = require('web3');
// const axios = require('axios');
// const sdk = require("@defillama/sdk");

const PITabi = require('./pit-abi.json');
const erc20abi = require('./erc20abi.json');
const lendingPoolsabi = require('./lendingPool-abi.json'); // Assuming this is the correct ABI for fToken

const rpcUrls = {
    arbitrum: "https://arb1.arbitrum.io/rpc",
    optimism: "https://mainnet.optimism.io",
    polygon:  "https://rpc-mainnet.maticvigil.com",
    // ethereum: "https://rpc.payload.de",
    // ethereum: "https://eth.llamarpc.com",
    ethereum: 'https://endpoints.omniatech.io/v1/eth/mainnet/public',
    era:      "https://mainnet.era.zksync.io"
};

// Fringe's primary lending platform contracts for each chain.
const primaryLendingPlatforms = {
    arbitrum: "0x5855F919E89c5cb5e0052Cb09addEFF62EB9339A",
    optimism: "0x088F23ac0c07A3Ce008FB88c4bacFF06FECC6158",
    polygon:  "0x286475366f736fcEeB0480d7233ef169AE614Fe4",
    ethereum: "0x70467416507B75543C18093096BA4612a9261DB8",
    era:      "0x8f1d37769a56340542Fb399Cb1cA49d46Aa9fec8"
};

// TVL = lender deposits plus collateral deposits
async function calcTVLperChain(chain) {
    let tokenList = {}
    const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrls[chain]));
    const plpContract = new web3.eth.Contract(PITabi, primaryLendingPlatforms[chain]);

    // Process Lending Tokens' TVL
    const lendingTokensCount = await plpContract.methods.lendingTokensLength().call();
    for (let i = 0; i < lendingTokensCount; i++) {
        const underlyingTokenAddy = (await plpContract.methods.lendingTokens(i).call()).toLowerCase();        
        const lendingTokenPoolAddy = (await plpContract.methods.lendingTokenInfo(underlyingTokenAddy).call()).bLendingToken.toLowerCase();
        
        // Pause for half a second to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
        const underlyingTokenContract = new web3.eth.Contract(erc20abi, underlyingTokenAddy); 
        const tokenLenderDeposits = await underlyingTokenContract.methods.balanceOf(lendingTokenPoolAddy).call();

        let chainAndAddress = `${chain}:${underlyingTokenAddy}`
        
        tokenList[chainAndAddress] = tokenLenderDeposits;
    }

    // Process Project (collateral) Tokens' TVL  
    const projectTokensCount = await plpContract.methods.projectTokensLength().call();

    for (let i = 0; i < projectTokensCount; i++) {
        const projectTokenAddy = (await plpContract.methods.projectTokens(i).call()).toLowerCase();
        // Pause for half a second to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));

        const tokenCollateralDeposits = await plpContract.methods.totalDepositedProjectToken(projectTokenAddy).call();

        let chainAndAddress = `${chain}:${projectTokenAddy}`
        
        // Check if ChainAndAddress already exists in tokenList
        if (tokenList.hasOwnProperty(chainAndAddress)) {
            // If it exists, add TVLToAdd to the existing TVL value
            tokenList[chainAndAddress] = (BigInt(tokenList[chainAndAddress]) + BigInt(tokenCollateralDeposits)).toString();
        } else {
            // If it doesn't exist, create a new entry
            tokenList[chainAndAddress] = tokenCollateralDeposits;
        }        
    }
    
    return tokenList
}

async function calcLoansPerChain(chain) {
    let lendingTokenBorrows = {};
    const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrls[chain]));
    const plpContract = new web3.eth.Contract(PITabi, primaryLendingPlatforms[chain]);

    // Process Lending Tokens
    const lendingTokensCount = await plpContract.methods.lendingTokensLength().call();
    for (let i = 0; i < lendingTokensCount; i++) {
        const underlyingTokenAddy = (await plpContract.methods.lendingTokens(i).call()).toLowerCase();        
        const lendingTokenPoolAddy = (await plpContract.methods.lendingTokenInfo(underlyingTokenAddy).call()).bLendingToken.toLowerCase();

        // Pause for half a second to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
       
        const lendingPoolContract = new web3.eth.Contract(lendingPoolsabi, lendingTokenPoolAddy);
        
        // Get total borrow of this lending token
        const tokenBorrow = await lendingPoolContract.methods.totalBorrows().call();

        lendingTokenBorrows[`${chain}:${underlyingTokenAddy}`] = tokenBorrow;
    }
    return lendingTokenBorrows

}

// TVL handlers
const ethereumTvl = async (timestamp, block, _, { api }) => {
    const tvl = calcTVLperChain('ethereum');
    return tvl
}

const arbitrumTvl = async (timestamp, block, _, { api }) => {
    const tvl = calcTVLperChain('arbitrum');
    return tvl
}

const polygonTvl = async (timestamp, block, _, { api }) => {
    const tvl = calcTVLperChain('polygon')
    return tvl
}

const optimismTvl = async (timestamp, block, _, { api }) => {
    const tvl = calcTVLperChain('optimism')
    return tvl
}

const zkeraTvl = async (timestamp, block, _, { api }) => {
    const tvl = calcTVLperChain('era');
    return tvl
}


// LOAN handlers
const ethereumLoans = async (timestamp, block, _, { api }) => {
    const loans = calcLoansPerChain('ethereum');
    return loans
}

const arbitrumLoans = async (timestamp, block, _, { api }) => {
    const loans = calcLoansPerChain('arbitrum');
    return loans
}

const polygonLoans = async (timestamp, block, _, { api }) => {
    const loans = calcLoansPerChain('polygon');
    return loans
}

const optimismLoans = async (timestamp, block, _, { api }) => {
    const loans = calcLoansPerChain('optimism');
    return loans
}

const zkeraLoans = async (timestamp, block, _, { api }) => {
    const loans = calcLoansPerChain('era');
    return loans
}


module.exports = {
    
    ethereum: {
        tvl: ethereumTvl,
        borrowed: ethereumLoans
        },
    arbitrum: {
        tvl:      arbitrumTvl,
        borrowed: arbitrumLoans
        },
    polygon: {
        tvl:      polygonTvl,
        borrowed: polygonLoans
        },
    optimism: {
        tvl:      optimismTvl,
        borrowed: optimismLoans
        },
    era: {
        tvl:      zkeraTvl,
        borrowed: zkeraLoans
        }
  };

