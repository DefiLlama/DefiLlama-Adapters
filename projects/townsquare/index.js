const ADDRESSES = require('../helper/coreAssets.json');

const pools = {
    "0x106d0e2bff74b39d09636bdcd5d4189f24d91433": ADDRESSES.null,
    "0xdb4e67f878289a820046f46f6304fd6ee1449281": ADDRESSES.monad.USDC,
    "0xf358f9e4ba7d210fde8c9a30522bb0063e15c4bb": ADDRESSES.monad.WMON
}

async function tvl({ api }) {
    const pooled = await api.multiCall({
        abi: 'function getDepositData() view returns(tuple(uint16 optimalUtilisationRatio, uint256 totalAmount, uint256 interestRate, uint256 interestIndex))',
        calls: Object.keys(pools).map(target => ({
            target,
        }))
    })

    pooled.forEach((pool, i) => {
        api.add(Object.values(pools)[i], pool.totalAmount)
    })
}


module.exports = {
    methodology:"Counts the total amount deposited in all pools",
    monad: {
        tvl
    }
}