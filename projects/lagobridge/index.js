const sdk = require("@defillama/sdk");

const bridgecontract = '0x3765f3e827f4AB5393c1cb2D85bAcd37664cE8cA';
const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

async function tvl(timestamp, block) {
    return { [ usdc ]:
    (await sdk.api.erc20.balanceOf({ target: usdc, owner: bridgecontract, block: block })).output
    };
};

module.exports = {
    methodology: "Tracks funds locked in the Lago Bridge contract on Ethereum",
    ethereum: {
        tvl
    }
};
