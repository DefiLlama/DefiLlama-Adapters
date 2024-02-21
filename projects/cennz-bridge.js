const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const target = '0x76BAc85e1E82cd677faa2b3f00C4a2626C4c6E32';
const WETH = ADDRESSES.ethereum.WETH;

async function tvl(timestamp, block, _) {
    return { [ WETH ]: 
        (await sdk.api.eth.getBalance({ target, block })).output 
    };
}

module.exports = {
    methodology: "Tracks funds locked in the ERC20Peg contract on Ethereum",
    ethereum: {
        tvl
    }
}; // node test.js projects/cennz-bridge.js