const ADDRESSES = require('../helper/coreAssets.json');

// ABI for fetching the conversion rate
const abis = {
    latestRoundData: "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
};

// Contract configurations
const configs = {
    wstASTRTokenAstar: '0x45cCC0DEA1470F1b4213Ab60fd2eBB2a063f1c24',
    wstASTROracleAstar: '0x3e0fcD6f779775Caec47E999F875C040E1a1DD2F',
    wstASTRTokenSoneium: '0x3b0DC2daC9498A024003609031D973B1171dE09E',
    wstASTROracleSoneium: '0x5A599251a359Cf27A6A42E7baB1b1494d3919083'
};
// Fetches TVL for wstASTR value to the API.
async function getSoneiumTvl(api) {
    // Fetch and calculate TVL for nsASTR
    const wstASTRSupply = await api.call({ target: configs.wstASTRTokenSoneium, abi: 'erc20:totalSupply' });
    const wstASTRRateData = await api.call({ target: configs.wstASTROracleSoneium, abi: abis.latestRoundData });
    const ratio = wstASTRRateData.answer / 1e8; 
    const stakedAmountInASTR = wstASTRSupply * ratio ; 
    api.add(ADDRESSES.soneium.ASTAR, stakedAmountInASTR);
}

module.exports = {
    soneium: {
        tvl: getSoneiumTvl
    },
    methodology: `TVL is calculated by fetching the total supply of wstASTR converting their values into the underlying tokens ASTR using the current conversion rate provided by the respective oracle.`
};




