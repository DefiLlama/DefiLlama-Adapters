const { queryV1Beta1 } = require('../helper/chain/cosmos.js');

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

const getBalances = async (api, isBorrowed) => {
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
            api.add(asset, isBorrowed ? borrowed : collateral)
        }
    }))
}

module.exports = {
    timetravel: false,
    doublecounted: true,
    misrepresentedTokens: true,
    methodology: 'TVL is calculated based on the total amount of collateral pledged to all lending pools.',
    provenance: {
        tvl: (api) => getBalances(api, false),
        borrowed: (api) => getBalances(api, true),
    }
}
