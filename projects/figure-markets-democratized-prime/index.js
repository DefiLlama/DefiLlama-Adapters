const { mapTokens } = require("../helper/chain/provenance")
const { get } = require("../helper/http")

const tokenMapper = {
    "HASH" : 'hash-2',
    "LINK": 'chainlink',
    "UNI": 'uniswap', 
    "BTC": 'bitcoin',
    "ETH": 'ethereum',
    "XRP": 'ripple',
    "SOL": 'solana',
    "LRWA": 'usd-coin',
    "YLDS": 'uylds.fcc',
    "USDC": 'usd-coin',
    "USD": 'usd-coin',
    "USDT": 'tether',
}

// Returns all leveraged pools in Figure Markets Democratized Prime
// https://www.figuremarkets.com/c/democratized-prime/lending-pools
const leveragePoolsUrl = 'https://www.figuremarkets.com/service-lending/api/v1/leverage-pools?location=US'

// Returns offer information for a specific asset
const offersUrl = (asset) => `https://www.figuremarkets.com/service-lending/api/v1/offers?asset=${asset}&location=US`

// Returns all assets, including lending facilities (specific to YLDS)
const lendingFacilities = `https://www.figuremarkets.com/service-hft-exchange/api/v1/assets?page=1&size=100&include_lending_facility_assets=true`

const getBalances = async () => {
    const balances = {}
    // Get all available pools
    const pools = (await get(leveragePoolsUrl)).map(p => p.asset)
    await Promise.all(pools.map(async p => {
        if (p !== 'YLDS') {
            // Get offers on each type that isn't YLDS
            const details = (await get(offersUrl(p)))
            // For collateral, subtracted the loan amount from the total amount
            balances[p] = { collateral: Number(details.totalOfferAmount) - Number(details.totalLoanAmount), borrowed: details.totalLoanAmount }
        } else {
            // For YLDS, get all existing lending facility pools
            const facilities = (await get(lendingFacilities)).data.filter(l => l.type === 'LENDING_FACILITY')
            // Reduce existing pools into a single amount, which represents the total pool collateral in the protocol
            const totalLendingFacilitiesValue = facilities.reduce((acc, cur) => acc += Number(cur.lendingFacilitiesDetails.unpaidBalance), 0)
            // Also pull the existing YLDS loan amount
            const borrowed = (await get(offersUrl(p))).totalLoanAmount
            // Convert final YLDS to uylds (exponent of 6)
            balances[p] = {collateral: (totalLendingFacilitiesValue - Number(borrowed)) * 1e6, borrowed: borrowed * 1e6 }
        }
    }))
    return balances
}

const tvl = async (api) => {
    const balances = await getBalances()
    let collateral = {}
    Object.keys(balances).map(b => collateral[tokenMapper[b]] = balances[b].collateral)
    Object.keys(collateral).map(coin => mapTokens(collateral, coin, api ))
}

const borrowed = async (api) => {
    const balances = (await getBalances())
    let borrowed = {}
    Object.keys(balances).map(b => borrowed[tokenMapper[b]] = balances[b].borrowed)
    Object.keys(borrowed).map(coin => mapTokens(borrowed, coin, api ))
}

module.exports = {
    timetravel: false,
    doublecounted: true,
    misrepresentedTokens: true,
    methodology: 'Figure Markets Democratized Prime calculates the loan pool amount as TVL, with outstanding loans as the borrowed amount.',
    provenance: {
        tvl,
        borrowed,
    }
}