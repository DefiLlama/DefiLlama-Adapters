
async function tvl(api) {
    const CFAT = "0x14E3206C7146aCBc9274af8E2B0BEB4bB6e1eF54"
    const supply = await api.call({ abi: 'erc20:totalSupply', target: CFAT })
    api.add(CFAT, supply)
}

module.exports = {
    methodology: "TVL is fetched from CycleX oracle",
    base: {
        tvl
    },
}
