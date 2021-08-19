const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");

function transformAddressKF() {
    return (addr) => {
        if (addr.toLowerCase() === '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619') {
            return '0x0000000000000000000000000000000000000000'
        }
        return `polygon:${addr}`
    }
}

async function getSinglePositions(balances, lpPositions, block, chain='ethereum', transformAddress=(addr)=>addr) {
      await Promise.all(lpPositions.map(lpPosition => {
          const underlyingToken = lpPosition.token;
          const underlyingTokenBalance = lpPosition.balance;
          sdk.util.sumSingleBalance(balances, transformAddress(underlyingToken), underlyingTokenBalance);
      }))
}


module.exports = {
    transformAddressKF,
    getSinglePositions
};
