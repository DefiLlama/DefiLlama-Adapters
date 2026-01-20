const { queryV1Beta1 } = require('../helper/chain/cosmos.js');
const { sumTokens2 } = require('../helper/unwrapLPs');

const demoPrimePools = [
    "scope1qp4lyqj9xkp570uj9l0sf6vhh46q599mcf", // Margin USD
    "scope1qpjqqp93nfn537acqgl6aauhj6ws8xk5ug", // YLDS HELOCS
    "scope1qztpy0phjx0y8x902phqc4zvnktq0eru49", // YLDS HELOC+
    "scope1qr84e8k4u2p5tn99wd5ra97mj8sq73e3xk", // YLDS CBL
    "scope1qq4ghl8h8dv5ugdyty66acmsc0ksld5llq", // Margin SOL
    "scope1qqq6xkv4g9y50649l0r96us54aasd4ur5l", // Margin BTC
    "scope1qz6rjfu4ympyxs5wd2nzpa3z0t7s0tw3ud", // Margin USDT
    "scope1qz8xvt4mckfyssyln509g5ck3ejs7aq9yc", // Margin USDC
    "scope1qzh44upjuvzyh25usrsl6w3rv9yqxs9w6n", // Margin ETH
]

const collateralizedAssets = [
    'pm.sale.pool.3dxq3fk9llvhrqqwhodiap', // YLDS HELOCs
    'pm.pool.asset.1y3flutqcyuf8duew1vj2g', // YLDS CBLs
    'pm.pool.asset.3hjz8rcr3pejdc3msntlvy' // YLDS HELOC+
]

const getPools = async (api) => {
    let asset = collateralizedAssets[0]
    await Promise.all(demoPrimePools.map(async pool => {
        const poolHash = (await queryV1Beta1({
            chain: 'provenance',
            url: `metadata/v1/scope/${pool}/record/pool-details`
        })).records[0]?.record?.outputs[0]?.hash
        if (poolHash) {
            const poolInfo = JSON.parse(poolHash)
            if (poolInfo.leveragePool.collateralAssets.length > 0 && collateralizedAssets.includes(poolInfo.leveragePool.collateralAssets[0])) {
                asset = poolInfo.leveragePool.collateralAssets[0]
                api.add(asset, poolInfo.collateralValue)
            }
        }
    }))
}

const tvl = async (api) => {
    await getPools(api)
    return sumTokens2({ api })
}

const borrowed = async (api) => {
    await Promise.all(demoPrimePools.map(async pool => {
        const poolHash = (await queryV1Beta1({
            chain: 'provenance',
            url: `metadata/v1/scope/${pool}/record/pool-details`
        })).records[0]?.record?.outputs[0]?.hash

        if (poolHash) {
            const poolInfo = JSON.parse(poolHash)
            let asset = poolInfo.leveragePool.asset
            let borrowed = poolInfo.currentPeriod.totalLoanAmount
            api.add(asset, borrowed)
        }
    }))
}

module.exports = {
    timetravel: false,
    doublecounted: true,
    misrepresentedTokens: true,
    methodology: 'TVL is calculated based on the total amount of collateral pledged to all lending pools.',
    provenance: {
        tvl,
        borrowed,
    }
}
