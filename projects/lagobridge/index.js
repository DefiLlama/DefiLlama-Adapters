const sdk = require("@defillama/sdk");

const bridgecontract = '0xc6895a02F9dFe64341c7B1d03e77018E24Db15eD';
const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const wbtc = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'

async function tvl(timestamp, block) {
    
    const balances = {}
    const usdc_balance = (await sdk.api.erc20.balanceOf({ target: usdc, owner: bridgecontract, block: block })).output
    const wbtc_balance = (await sdk.api.erc20.balanceOf({ target: wbtc, owner: bridgecontract, block: block })).output
    
    balances[usdc] = usdc_balance
    balances[wbtc] = wbtc_balance

    return balances
};

module.exports = {
    methodology: "Tracks funds locked in the Lago Bridge contract on Ethereum",
    ethereum: {
        tvl
    }
};
