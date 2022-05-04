const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock');
const { calculateUsdUniTvlPairs } = require('../helper/getUsdUniTvl')
const { stakingPricedLP, staking } = require('../helper/staking')
const { default: BigNumber } = require('bignumber.js');
const kashipairABI = require('../helper/abis/kashipair.json');
const totalBorrow = kashipairABI.find(val => val.name === "totalBorrow");

const CHAIN = "smartbch"

// token contracts
const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04"
const LAW = "0x0b00366fBF7037E9d75E4A569ab27dAB84759302"
const lawETP = "0x4ee06d0486ced674E75Ed9e521725580e8ffDA21"
const lawUSD = "0xE1E655BE6F50344e6dd708c27BD8D66492d6ecAf"
const FLEXUSD = "0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72"
const DAIQUIRI = "0x24d8d5Cbc14FA6A740c3375733f0287188F8dF3b"

// tvl pools
const BCH_POOL = "0x896a8ddb5B870E431893EDa869feAA5C64f85978" // BCH single asset pool
const lawETP_POOL = "0x7B2B28a986E744D646F43b9b7e9F6f416a2a2BdA" // lawETP single asset pool
const DAIQUIRI_POOL = "0x82112e12533A101cf442ee57899249C719dc3D4c" // daiquiri signle asset pool, ended

// tvl pairs
const LAW_LAWETP_PAIR = "0x8735628e1e5442b49a37f9751b0793c11014d1b6"
const LAWPAIRS = [
    "0x8735628e1e5442b49a37f9751b0793c11014d1b6", // beam: LAW-lawETP @lawswap
    "0xd55a9a41666108d10d31baeeea5d6cdf3be6c5dd", // beam: LAW-BCH @BEN
    "0x1d5a7bea34ee984d54af6ff355a1cb54c29eb546", // beam: LAW-lawUSD @MIST
    "0x88b2522b9f9121b3e19a28971a85d34d88e4acc6", // beam: LAW-lawETP @BEN
    "0x54AA3B2250A0e1f9852b4a489Fe1C20e7C71fd88", // rebase: LAW-BCH @lawswap
]
const BCHPAIRS = [
    "0xFEdfE67b179b2247053797d3b49d167a845a933e", // lawUSD-BCH @BEN
]
const FLEXUSDPAIRS = [
    "0x8e992c4c2c84e5d372ef9a933be06f34962e42f5", // lawUSD-flexUSD @BEN
]

async function bchPool(timestamp, ethBlock, chainBlocks) {
    const block = await getBlock(timestamp, CHAIN, chainBlocks, true);

    const pooledBCH = (await sdk.api.eth.getBalance({
        target: BCH_POOL,
        chain: CHAIN,
        block: block,
        decimals: 18
    })).output;

    return {
        "bitcoin-cash": Number(pooledBCH)
    }
}
const lawEtpPool = stakingPricedLP(lawETP_POOL, lawETP, "smartbch", LAW_LAWETP_PAIR, "law", 18)
const daiquiriPool = staking(DAIQUIRI_POOL, DAIQUIRI, "smartbch", "tropical-finance", 18)

const lawTVLs = calculateUsdUniTvlPairs(LAWPAIRS, CHAIN, LAW, [lawETP, WBCH, lawUSD], "law", 18)
const bchTVLs = calculateUsdUniTvlPairs(BCHPAIRS, CHAIN, WBCH, [lawUSD], "bitcoin-cash", 18)
const flexUSDTVLs = calculateUsdUniTvlPairs(FLEXUSDPAIRS, CHAIN, FLEXUSD, [lawUSD], "flex-usd", 18)

// todo: query data from api
// punksTVL in BCH = PunkFloor * TotalPunks * (StakedHash / TotalHash)
const punksTVL = () => ({ "bitcoin-cash": 0.73 * 10000 * (110665.166 / 145279.572) })

const BENTOBOX = "0xDFD09C4A1Fd999F6e8518398216c53fcEa6f4020"
const bentoAssets = [
    [LAW, "law"],
    [WBCH, "bitcoin-cash"]
]
const bentoTVLs = bentoAssets.map(asset => staking(BENTOBOX, asset[0], CHAIN, asset[1], 18))

const totalTVLs = sdk.util.sumChainTvls([lawTVLs, bchTVLs, flexUSDTVLs, bchPool, lawEtpPool, daiquiriPool, punksTVL, ...bentoTVLs])

// staking
const LAW_RIGHTS = "0xe24Ed1C92feab3Bb87cE7c97Df030f83E28d9667" // DAO address
const daoStaking = staking(LAW_RIGHTS, LAW, "smartbch", "law", 18)

// borrows
const kashiPairs = [
    ["0x3F562957b199d6362B378dBa5e3b45EE6fe77779", WBCH, lawUSD],
    ["0xd46e5a9Cd7A55Bf8d3582Ff66218aD3e63462506", LAW, lawUSD],
]

const bentoBorrows = async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, CHAIN, chainBlocks, false)
    const totals = await Promise.all(kashiPairs.map(async (pair) => {
        const total = (await sdk.api.abi.call({
            target: pair[0],
            abi: totalBorrow,
            chain: CHAIN,
            block
        })).output
        return total.base
    }))
    const total = totals.reduce((sum, val) => BigNumber(sum).plus(val).toFixed(0), "0")

    // skip conversion assuming 1 lawUSD = 1 flexUSD
    return {'flex-usd': BigNumber(total).dividedBy(10 ** 18)}
}

module.exports = {
    misrepresentedTokens: true,
    methodology: "BlockNG uses LP pools created across many dexes for their liquidity mining, these pools are handpicked for TVL calculation. LAW tokens sent to the DAO contract are counted towards staking. Lent lawUSD tokens from lending contract are counted towards borrows",
    smartbch: {
        tvl: totalTVLs,
        staking: daoStaking,
        borrowed: bentoBorrows,
    },
}
