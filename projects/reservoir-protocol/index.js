const config = {
    ethereum: [
        // https://docs.reservoir.xyz/products/proof-of-reserves
        '0x0c7e4342534e6e8783311dCF17828a2aa0951CC7',
        '0x9BB2c38F57883E5285b7c296c66B9eEA4769eF80',
        '0x99A95a9E38e927486fC878f41Ff8b118Eb632b10',
        '0x31Eae643b679A84b37E3d0B4Bd4f5dA90fB04a61'
    ]
}

Object.keys(config).forEach(chain => {
    const funds = config[chain]
    module.exports[chain] = {
        tvl: async (api) => {
            const tokens = await api.multiCall({ abi: 'address:underlying', calls: funds })
            const bals = await api.multiCall({ abi: 'uint256:totalValue', calls: funds })
            const decimals = await api.multiCall({ abi: 'uint8:decimals', calls: tokens })
            bals.forEach((v, i) => bals[i] = v * 10 ** (decimals[i] - 18))
            api.add(tokens, bals)

            const psmBal = await api.call({ abi: 'erc20:balanceOf', target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', params: ['0x4809010926aec940b550D34a46A52739f996D75D'] })

            api.add('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', psmBal)
        },
        borrowed: async (api) => {
            const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: '0x09D4214C03D01F49544C0448DBE3A27f768F2b34' })

            api.add('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', totalSupply / 1e12)
        }
    }
})