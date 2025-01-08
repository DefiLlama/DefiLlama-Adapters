const ZeUSD = '0x7DC9748DA8E762e569F9269f48F69A1a9F8Ea761'
const ZeUSD_Metis = '0x2d3D1a6982840Dd88bC2380Fd557F8A9D5e27a77'

const mainnet_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: ZeUSD })
    api.add(ZeUSD, supply)
}
const manta_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: ZeUSD })
    api.add(ZeUSD, supply)
}

const metis_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: ZeUSD_Metis })
    api.add(ZeUSD_Metis, supply)
}


module.exports = {
    timetravel: false,
    methodology: "Sums total ZeUSD in circulation across all chains",
    ethereum: {
        tvl: mainnet_tvl
    },
    manta: {
        tvl: manta_tvl
    },
    metis: {
        tvl: metis_tvl
    },
};