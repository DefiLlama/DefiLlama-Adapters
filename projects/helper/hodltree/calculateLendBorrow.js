const sdk = require('@defillama/sdk');
const erc20 = require("../abis/erc20.json");
const {
    dexTypes
} = require('../../config/hodltree');

/**
 * @param {import("../../config/hodltree/addresses").Dex} dex 
 * @param {} chain
 * @param {} chainBlocks
 */
async function calculateLendBorrow(dex, chain, chainBlocks) {
    let calls = [];
    let tokens = [];

    dex.contracts.map((contract) => {
        let token = contract.miscInfo.tokenIn;
        tokens.push(token);
        calls.push({
            target: token,
            params: contract.address
        });
    });

    const lendBorrowBalances = (
        await sdk.api.abi.multiCall({
            abi: erc20.balanceOf,
            calls,
            chain: chain,
            block: chainBlocks[chain],
        })
    ).output.map((val) => val.output);

    let res = [];

    for (let tokenId = 0; tokenId < tokens.length; tokenId++) {
        res.push([tokens[tokenId], lendBorrowBalances[tokenId]]);
    }

    return res;
}

module.exports = {
    calculateLendBorrow
}