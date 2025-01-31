const ADDRESSES = require('../helper/coreAssets.json');

// ABI for fetching the conversion rate
const abis = {
    getRate: "function getRate() view returns (uint256)"
};

// Contract configurations
const configs = {
    nsASTRToken: '0xc67476893C166c537afd9bc6bc87b3f228b44337',
    nsASTRManager: '0x85031E58C66BA47A16Eef7A69514cd33EC16559c',
    nrETHToken: '0x2fc9a87b1ef46dCDdF4801C36d752E0d5F243E4b',
    nrETHManager: '0xf5AeA1089D075C8f16095aa11be4114350383a9B'
};

// Fetches TVL for nsASTR and nrETH and adds their value to the API.
async function getNeemoTvl(api) {
    // Fetch and calculate TVL for nsASTR
    const nsASTRSupply = await api.call({ target: configs.nsASTRToken, abi: 'erc20:totalSupply' });
    const nsASTRRate = await api.call({ target: configs.nsASTRManager, abi: abis.getRate });
    const stakedAmountInASTR = (nsASTRSupply * nsASTRRate) / 1e18;
    api.add(ADDRESSES.soneium.ASTAR, stakedAmountInASTR);

    // Fetch and calculate TVL for nrETH
    const nrETHSupply = await api.call({ target: configs.nrETHToken, abi: 'erc20:totalSupply' });
    const nrETHRate = await api.call({ target: configs.nrETHManager, abi: abis.getRate });
    const stakedAmountInETH = (nrETHSupply * nrETHRate) / 1e18;
    api.add(ADDRESSES.soneium.WETH, stakedAmountInETH);
}

module.exports = {
    soneium: {
        tvl: getNeemoTvl
    },
    methodology: `TVL is calculated by fetching the total supply of nsASTR and nrETH tokens and converting their values into the underlying tokens (ASTR and WETH) using the current conversion rate provided by the respective managers.`
};