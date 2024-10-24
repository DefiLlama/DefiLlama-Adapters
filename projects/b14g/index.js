const EARN_RATE_BASE = 1000000
const Staking = '0x788CC33E9365d8b4F8dEcEF9AeDf5F5fdcDb664B';
const Earn = '0xf5fA1728bABc3f8D2a617397faC2696c958C3409';
const apiStat = 'https://api.b14g.xyz/restake/stats'


module.exports = {
    core: {
        tvl: async function tvl(api) {
            let rate = await api.call({abi: "uint256:getCurrentExchangeRate", target: Earn,})
            let amount = await api.call({abi: "uint256:totalDelegatedStCore", target: Staking,})
            const response = await fetch(apiStat);
            const data = await response.json();
            let amountBTC = Number(data.totalBtc)
            api.addGasToken(amount * Number(rate) / EARN_RATE_BASE)
            api.addCGToken('bitcoin', amountBTC)
        }
    },
}


