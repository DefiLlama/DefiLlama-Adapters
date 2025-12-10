const { sumTokens2 } = require('../helper/unwrapLPs');
const { queryV1Beta1 } = require('../helper/chain/cosmos.js');

// node test.js projects/figure-markets-democratized-prime/index.js

// Contracts holding the pool collateral
const demoPrimePools = [
    "scope1qp4lyqj9xkp570uj9l0sf6vhh46q599mcf",
    "scope1qpjqqp93nfn537acqgl6aauhj6ws8xk5ug",
    "scope1qq4ghl8h8dv5ugdyty66acmsc0ksld5llq",
    "scope1qqq6xkv4g9y50649l0r96us54aasd4ur5l",
    "scope1qz6rjfu4ympyxs5wd2nzpa3z0t7s0tw3ud",
    "scope1qz8xvt4mckfyssyln509g5ck3ejs7aq9yc",
    "scope1qzh44upjuvzyh25usrsl6w3rv9yqxs9w6n",
]

const getBalances = async () => {
    const balances = {}
    await Promise.all(demoPrimePools.map(async pool => {
        const poolHash = (await queryV1Beta1({
            chain: 'provenance',
            url: `metadata/v1/scope/${pool}/record/pool-details`
        })).records[0]?.record?.outputs[0]?.hash
        if (poolHash) {
            const poolInfo = JSON.parse(poolHash)
            let asset = poolInfo.leveragePool.asset
            let collateral = poolInfo.currentPeriod.totalOfferAmount - poolInfo.currentPeriod.totalLoanAmount
            let borrowed = poolInfo.currentPeriod.totalLoanAmount
            if (asset === 'YLDS') {
                collateral = poolInfo.collateralValue
            }
            balances[asset] = { 
                collateral,
                borrowed
            }
        }
    }))
    return balances
}

const tvl = async (api) => {
    const balances = await getBalances()
    Object.keys(balances).map(token => api.add(token, balances[token].collateral))
    return sumTokens2({ api })
}

const borrowed = async (api) => {
    const balances = (await getBalances())
    Object.keys(balances).map(token => {api.add(token, balances[token].borrowed)})
    return sumTokens2({ api })
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
