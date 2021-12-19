const {getBalance, unwrapLp} = require('../helper/terra')

const pairs = [
    "terra1nuy34nwnsh53ygpc4xprlj263cztw7vc99leh2", //bLUNA-LUNA 
    "terra17dkr9rnmtmu7x4azrpupukvur2crnptyfvsrvr",
    "terra1gecs98vcuktyfkrve9czrpgtg0m3aq586x6gzm",
    "terra17gjf2zehfvnyjtdgua9p9ygquk6gukxe7ucgwh",
    "terra1rqkyau9hanxtn63mjrdfhpnkpddztv3qav0tq2",
    "terra1uwhf02zuaw7grj6gjs7pxt5vuwm79y87ct5p70",
    "terra17fysmcl52xjrs8ldswhz7n6mt37r9cmpcguack",
    "terra1q6r8hfdl203htfvpsmyh8x689lp2g0m7856fwd",
    "terra1n3gt4k3vth0uppk0urche6m3geu9eqcyujt88q",
    "terra14ffp0waxcck733a9jfd58d86h9rac2chf5xhev"
]

const holder = "terra1627ldjvxatt54ydd3ns6xaxtd68a2vtyu7kakj"

async function tvl() {
    const ustBalances = {}
    const lunaBalances = {}
    await Promise.all(pairs.map(async (pair,i) => {
        const balance = await getBalance(pair, holder)
        if(i>0){
            await unwrapLp(ustBalances, pair, balance)
        } else {
            await unwrapLp(lunaBalances, pair, balance)
        }
    }))
    return {
        'terrausd': ustBalances.uusd*2 / 1e6,
        'terra-luna': lunaBalances.uluna*2/1e6
    }
}

module.exports = {
    tvl,
    misrepresentedTokens: true,
    timetravel: false,
}