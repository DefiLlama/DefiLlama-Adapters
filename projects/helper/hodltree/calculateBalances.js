const sdk = require('@defillama/sdk');

const {
    ethContracts,
    polygonContracts,
    dexTypes
} = require('../../config/hodltree');
const { transformPolygonAddress, transformEthereumAddress } = require('../portedTokens');
const { calculateEM } = require('./calculateEM');
const { calculateFlashloan } = require('./calculateFlashloan');
const { calculateLendBorrow } = require('./calculateLendBorrow');

async function calculateHodltreeBalances(dexes, chain, chainBlocks, transform) {
    let tokenBalances = [];
    for (let dex of dexes) {
        let res;
        switch (dex.dexType) {
            case dexTypes.dexType.flashloan: 
                res = await calculateFlashloan(dex, chain, chainBlocks)
                break

            case dexTypes.dexType.lendBorrow:
                res = await calculateLendBorrow(dex, chain, chainBlocks)
                break

            case dexTypes.dexType.em:
                res = await calculateEM(dex, chain, chainBlocks)
                break
        }
        tokenBalances = tokenBalances.concat(res);
    }
    const balances = {};
    tokenBalances.map((tokenBalancePair) => {
        sdk.util.sumSingleBalance(balances, transform(tokenBalancePair[0]), tokenBalancePair[1]);
    })

    return balances;
}

async function calculateHodltreeBalancesEth(timestamp, block, chainBlocks) {
    const transform = await transformEthereumAddress();
    return calculateHodltreeBalances(ethContracts, 'ethereum', chainBlocks, transform);
}

async function calculateHodltreeBalancesPolygon(timestamp, block, chainBlocks) {
    const transform = await transformPolygonAddress()
    return calculateHodltreeBalances(polygonContracts, 'polygon', chainBlocks, transform);

}

module.exports = {
    calculateHodltreeBalancesEth,
    calculateHodltreeBalancesPolygon
}