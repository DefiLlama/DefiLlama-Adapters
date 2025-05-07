const config = {
    ethereum: "0x19Ebd191f7A24ECE672ba13A302212b5eF7F35cb", 
    optimism: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    arbitrum: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    base: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
}

Object.keys(config).forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: config[chain] })
            api.add(config[chain], supply)
        }
    }
})