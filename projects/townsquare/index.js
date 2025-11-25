const ADDRESSES = require('../helper/coreAssets.json');

const pools = {
    "0x106d0e2bff74b39d09636bdcd5d4189f24d91433": ADDRESSES.null,
    "0xdb4e67f878289a820046f46f6304fd6ee1449281": "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
    "0xf358f9e4ba7d210fde8c9a30522bb0063e15c4bb": "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A"
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