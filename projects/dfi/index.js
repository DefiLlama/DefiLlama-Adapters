const sdk = require('@defillama/sdk');
const abi = require('./abi.json')

const DFI_ADDRESS = '0xA9536B9c75A9E0faE3B56a96AC8EdF76AbC91978';

async function tvl(timestamp, block) {
    let balances = {};
    const underlyings = await sdk.api.abi.call({
        block,
        target: DFI_ADDRESS,
        abi: abi.getTokens
    });
    for (const token of underlyings.output) {
        const held = await sdk.api.erc20.balanceOf({
            block,
            target: token,
            owner: DFI_ADDRESS
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