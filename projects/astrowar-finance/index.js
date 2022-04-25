const sdk = require('@defillama/sdk');
const { getChainTransform } = require('../helper/portedTokens');
const { getPoolInfo, getSymbolsAndBalances } = require('../helper/masterchef')
// Enso finance TVL lies for now in the index tokens held by the liquidityMigration contracts
const stakePool = '0x1B7084DD5A3874C7DE8ff3e7AA668290f0613Afb';
const masterChef = '0x50bca04eb01e4B66cBb04dcdFA872D23942D0B00';
const standardPoolInfoAbi = { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "poolInfo", "outputs": [{ "internalType": "contract IERC20", "name": "lpToken", "type": "address" }, { "internalType": "uint256", "name": "allocPoint", "type": "uint256" }, { "internalType": "uint256", "name": "lastRewardBlock", "type": "uint256" }, { "internalType": "uint256", "name": "accWeVEPerShare", "type": "uint256" }], "stateMutability": "view", "type": "function" }
const chain = 'harmony'
async function tvl(timestamp, block) {
    const poolInfo = await getPoolInfo(masterChef, block, chain, standardPoolInfoAbi)
    const balances = {};
    const transformAddress = await getChainTransform(chain);
    const lpPositions = [];
    const [symbols, tokenBalances] = await getSymbolsAndBalances(stakePool, block, chain, poolInfo);
    await Promise.all(symbols.output.map(async (symbol, idx) => {
        const balance = tokenBalances.output[idx].output;
        const token = symbol.input.target.toLowerCase();
        if (isLP(symbol.output)) {
            lpPositions.push({
                balance,
                token
            });
        } else {
            console.log(transformAddress(token))
            sdk.util.sumSingleBalance(balances, transformAddress(token), balance)
        }
    }));
    return balances;
}

function isLP(symbol) {
    return symbol.includes('LP') || symbol.includes('PGL') || symbol.includes('UNI-V2') || symbol === "PNDA-V2" || symbol.includes('GREEN-V2')
}




module.exports = {
    deadFrom: 1650564340,
    harmony: {
        tvl
    }
};