const sdk = require('@defillama/sdk');

const erc20 = require("../abis/erc20.json");

/**
 * @param {import("../../config/hodltree/addresses").Dex} dex 
 * @param {} chain
 * @param {} chainBlocks
 */
async function calculateEM(dex, chain, chainBlocks) {
    let tokens = [];
    let calls = [];
    dex.contracts.map((contract) => {
        let token = contract.miscInfo.token;
        tokens.push(token);
        calls.push({
            target: token,
            params: contract.address
        })
    })

    const flashloanBalances = (
        await sdk.api.abi.multiCall({
            abi: erc20.balanceOf,
            calls,
            chain: chain,
            block: chainBlocks[chain],
        })
    ).output.map((val) => val.output);

    let res = [];

    for (let tokenId = 0; tokenId < tokens.length; tokenId++) {
        res.push([tokens[tokenId], flashloanBalances[tokenId]]);
    }

    return res;
}

module.exports = {
    calculateEM
}