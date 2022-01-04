const sdk = require('@defillama/sdk');
const abi = require('./abi.json')

const DFI_ADDRESS = '0xA9536B9c75A9E0faE3B56a96AC8EdF76AbC91978';
const DMX_ADDRESS = '0x1660F10B4D610cF482194356eCe8eFD65B15bA83';

function chainTvl(chain, tokens) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const block = chainBlocks[chain]
        const balances = {};
        for (const address of tokens) {
            const underlyings = await sdk.api.abi.call({
                block,
                target: address,
                abi: abi.getTokens,
                chain
            });
            for (const token of underlyings.output) {
                const held = await sdk.api.erc20.balanceOf({
                    block,
                    target: token,
                    owner: address,
                    chain
                });
                sdk.util.sumSingleBalance(balances, chain+':'+token, held.output)
            };
        }

        return balances;
    }
}

module.exports = {
    ethereum: {
        tvl: chainTvl("ethereum", [DFI_ADDRESS, DMX_ADDRESS])
    },
    polygon: {
        tvl: chainTvl("polygon", ["0xA9536B9c75A9E0faE3B56a96AC8EdF76AbC91978"])
    },
    methodology: `Amun Tokens has two investment strategies available which are the Defi Token Index(DFI) and the Defi Momentum Index(DMX) and each strategy has its own address where the underlying tokens are held. To get the TVL, first of all, an on-chain call is made using the function 'tvl()' that retrieves each token that is held within the strategy addresses. Then another function 'balanceOf()' is used to get the balances of these tokens which are added and used as TVL`
};