const assets = {
    polygon: [
        '0xe4880249745eAc5F1eD9d8F7DF844792D560e750',
        '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80'
    ],
    ethereum: [
        '0xe4880249745eAc5F1eD9d8F7DF844792D560e750',
        '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80'
    ]
}

module.exports = {}

Object.keys(assets).forEach(chain => {
    module.exports[chain] = {
        tvl: (api) => api.multiCall({
            abi: 'erc20:totalSupply',
            calls: assets[api.chain].map(target => ({ target }))
        }).then(supplies => api.add(assets[api.chain], supplies))
    }
})