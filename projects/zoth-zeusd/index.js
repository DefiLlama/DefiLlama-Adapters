const ZeUSD = '0x7DC9748DA8E762e569F9269f48F69A1a9F8Ea761';

const mainnet_tvl = async (api) => {
    // Get the total supply of ZeUSD on Ethereum
    const supply_ethereum = await api.call({ abi: 'erc20:totalSupply', target: ZeUSD, chain: "ethereum" })

    // Get the total supply of ZeUSD on Manta
    const supply_manta = await api.call({ abi: 'erc20:totalSupply', target: ZeUSD, chain: "manta" })

    //Subtract the Manta supply from the Ethereum supply to get the total supply of Ethereum. 
    //This is done because ZeUSD is bridged from Ethereum to Manta using LayerZero OFT Adapter.
    const supply = supply_ethereum - supply_manta
    api.add(ZeUSD, supply - supply_manta)

}

const manta_tvl = async (api) => {
    const supply = await api.call({ abi: 'erc20:totalSupply', target: ZeUSD })
    api.add(ZeUSD, supply)
}

module.exports = {
    methodology: "Sums total ZeUSD in circulation across all chains",
    ethereum: {
        tvl: mainnet_tvl,
    },
    manta: {
        tvl: manta_tvl,
    },
};