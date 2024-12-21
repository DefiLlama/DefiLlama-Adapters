const getData = async () => {
    const response = await fetch('https://app.zoth.io/api/defillama')
    const data = await response.json()
    return data
}

const eth_tvl = async () => {
    try {
        const data = await getData()
        return Number(data.ethereum) / 1e6
    } catch (error) {
        return 0
    }
}

const manta_tvl = async () => {
    try {
        const data = await getData()
        return Number(data.manta) / 1e6
    } catch (error) {
        return 0
    }
}

const tvl = async () => {
    try {
        const data = await getData()
        return (Number(data.ethereum) + Number(data.manta)) / 1e6
    } catch (error) {
        return 0
    }
}

module.exports = {
    timetravel: false,
    methodology: "Sums total ZeUSD in circulation across all chains",
    ethereum: {
        fetch: eth_tvl,
    },
    manta: {
        fetch: manta_tvl,
    },
    fetch: tvl
};