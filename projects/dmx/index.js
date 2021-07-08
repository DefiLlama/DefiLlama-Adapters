const sdk = require('@defillama/sdk');
const abi = require('./abi.json')

const DMX_ADDRESS = '0x1660F10B4D610cF482194356eCe8eFD65B15bA83';

async function tvl(timestamp, block) {
    let balances = {};
    const underlyings = await sdk.api.abi.call({
        block,
        target: DMX_ADDRESS,
        abi: abi.getTokens
    });
    for (const token of underlyings.output) {
        const held = await sdk.api.erc20.balanceOf({
            block,
            target: token,
            owner: DMX_ADDRESS
        });
        balances[token] = held.output
    };

    return balances;
}

module.exports = {
    ethereum:{
      tvl
    },
    tvl,
  };