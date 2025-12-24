const { sumTokens2 } = require('../helper/unwrapLPs.js');
const { queryV1Beta1 } = require('../helper/chain/cosmos.js');

const figureContract = 'scope1qrm5d0wjzamyywvjuws6774ljmrqu8kh9x'

// Contracts holding Figure Markets pool collateral
const demoPrimePools = [
    "scope1qp4lyqj9xkp570uj9l0sf6vhh46q599mcf",
    "scope1qpjqqp93nfn537acqgl6aauhj6ws8xk5ug",
    "scope1qq4ghl8h8dv5ugdyty66acmsc0ksld5llq",
    "scope1qqq6xkv4g9y50649l0r96us54aasd4ur5l",
    "scope1qz6rjfu4ympyxs5wd2nzpa3z0t7s0tw3ud",
    "scope1qz8xvt4mckfyssyln509g5ck3ejs7aq9yc",
    "scope1qzh44upjuvzyh25usrsl6w3rv9yqxs9w6n",
]

const collateralizedAssets = 'pm.sale.pool.3dxq3fk9llvhrqqwhodiap'

const getPoolsCollateralValue = async () => {
    const collateralTotal = (await Promise.all(demoPrimePools.map(async pool => {
        const poolHash = (await queryV1Beta1({
            chain: 'provenance',
            url: `metadata/v1/scope/${pool}/record/pool-details`
        })).records[0]?.record?.outputs[0]?.hash
        if (poolHash) {
            const poolInfo = JSON.parse(poolHash)
            if (poolInfo.leveragePool.collateralAssets.length > 0 && poolInfo.leveragePool.collateralAssets[0] === collateralizedAssets) {
                return poolInfo.collateralValue
            }
        }
    }))).reduce((acc, cur) => acc += cur || 0, 0)
    return collateralTotal
}

const tvl = async (api) => {
    const records = await queryV1Beta1({
        chain: 'provenance',
        url: `metadata/v1/scope/${figureContract}/record/token`
    })
    const totalSupply = JSON.parse(records.records[0].record.outputs[0].hash).supply
    const figureMarketsLockedCollateral = await getPoolsCollateralValue()
    api.add('FIGR_HELOC', totalSupply - figureMarketsLockedCollateral)
    return sumTokens2({ api })
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: 'TVL is the total value of FIGR_HELOC tokens issued and traded on Figure Connect',
    provenance: {
        tvl,
    }
}