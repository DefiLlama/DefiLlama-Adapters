const ADDRESSES = require('../helper/coreAssets.json');

const pools = {
    "0x106d0e2bff74b39d09636bdcd5d4189f24d91433": ADDRESSES.null,
    "0xdb4e67f878289a820046f46f6304fd6ee1449281": ADDRESSES.monad.USDC,
    "0xf358f9e4ba7d210fde8c9a30522bb0063e15c4bb": ADDRESSES.monad.WMON,
    "0x7821ba4e39c86ac4bdd2482e853f9c7ba57d01d0": ADDRESSES.monad.USDT,
    "0x0394728ef18258ca21f782ce37ebf1a16799d7ef": ADDRESSES.monad.WETH,
    "0xd636d6ab7072483de6ddc067f9147f8c1e512f18": ADDRESSES.monad.WBTC,
    "0x7f5996865e952bd7892366712d319de59b9ecc6b": "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a" ,// AUSD
    "0x3249df5ca0b825e7c3e7d84a4bb11c2eacd8c0f6": "0x111111d2bf19e43C34263401e0CAd979eD1cdb61", // USD1
    "0x09cd0233ad57bac4f916ca7aa08321b96effbaf2": "0x336D414754967C6682B5A665C7DAF6F1409E63e8", //MUBOND
    "0xaa3f243731d724f2195271a9c3f5c744f0d0b948": "0x4917a5ec9fCb5e10f47CBB197aBe6aB63be81fE8", //AZND
    "0x7d99267be583d46273803b2b1c5edb98bff6538d": "0x103222f020e98Bba0AD9809A011FDF8e6F067496",// earnAUSD
    "0xd2108dec68089646c3d4d95f01ea42ee1142e7f4": "0x1B68626dCa36c7fE922fD2d55E4f631d962dE19c", //shMON
    "0xc0fda7f80e772ac3f85735f66ecb1ac964a033f2": "0xA3227C5969757783154C60bF0bC1944180ed81B9", //kintsu-staked-monad
    "0xfdd72592a657775249da1b013ac1371ccd45d885": "0x0c65A0BC65a5D819235B71F554D210D3F80E0852", //aprMON
    "0x428bebf994c970656854eb66586583fe682cc1d3": "0x8498312A6B3CbD158bf0c93AbdCF29E6e4F55081" //gMON
}




const tvl = async () => {
    const [totalDeposit, totalBorrowed] = await Promise.all([
     api.multiCall({
        abi: 'function getDepositData() view returns(tuple(uint16 optimalUtilisationRatio, uint256 totalAmount, uint256 interestRate, uint256 interestIndex))',
        calls: Object.keys(pools).map(target => ({
            target,
        }))
    }), 
    api.multiCall({
        abi: 'function getVariableBorrowData() view returns(tuple(uint32 vr0, uint32 vr1, uint32 vr2, uint256 totalAmount, uint256 interestRate, uint256 interestIndex))',
        calls: Object.keys(pools).map(target => ({
            target,
        }))
    })
])
     Object.values(pools).forEach((pool, i) => {
        api.add(pool, totalDeposit[i].totalAmount - totalBorrowed[i].totalAmount)
     })
}



async function borrowed({ api }) {
    const pooled = await api.multiCall({
        abi: 'function getVariableBorrowData() view returns(tuple(uint32 vr0, uint32 vr1, uint32 vr2, uint256 totalAmount, uint256 interestRate, uint256 interestIndex))',
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
        tvl,
        borrowed
    }
}