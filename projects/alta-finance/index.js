const sdk = require("@defillama/sdk");

module.exports = {
    methodology: "Sums the amount of funded real-world assets on ALTA Finance."
};

const investDebtContracts = {
    polygon: ["0xE92F580C930dd24aACB38Ab0EA18F6c1dEf31369"],
}

const investEquityContracts = {
    polygon: ["0xcf152E9f60E197A44FAdce961c6B822Dcb6c9dcc"]
}

Object.keys(investDebtContracts).forEach(async (chain) => {
    let fundsMap = investDebtContracts[chain];
    const fundAddresses = Object.values(fundsMap);
    let tvl_ = []
    for (let i = 0; i < fundAddresses.length; i++) {
        const investAmount = await sdk.api.abi.call({
            abi: 'uint256:amount',
            target: fundAddresses[i],
            chain
        })
        if(Number(investAmount.output) === 0) {
            tvl_.push(0)
        } else {
            const totalVolume = Number(investAmount.output) / 10**6;
            tvl_.push(totalVolume)
        }
    }
    module.exports[chain] = {
        tvl: tvl_.reduce((pv, cv) => pv + cv, 0)
    }
})

Object.keys(investEquityContracts).forEach(async (chain) => {
    let fundsMap = investEquityContracts[chain];
    const fundAddresses = Object.values(fundsMap);
    let tvl_ = []
    for (let i = 0; i < fundAddresses.length; i++) {
        const tokenIdCount = await sdk.api.abi.call({
            abi: 'uint256:_tokenIdCounter',
            target: fundAddresses[i],
            chain
        })
        const amountPerNft = await sdk.api.abi.call({
            abi: 'uint256:amountPerNft',
            target: fundAddresses[i],
            chain
        })  
        if(Number(tokenIdCount.output) === 0) {
            tvl_.push(0)
        } else {
            const totalVolume = Number(amountPerNft.output) * Number(tokenIdCount.output) / 10**6;
            tvl_.push(totalVolume)
        }
    }
    const tvl_sum = tvl_.reduce((pv, cv) => pv + cv, 0);
    module.exports[chain] = {
        tvl: module.exports[chain].tvl + tvl_sum
    }
})


