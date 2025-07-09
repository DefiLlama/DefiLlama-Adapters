const { api2 } = require("@defillama/sdk");

module.exports = {
    hallmarks: [
      ['2025-05-02', 'Launched v2 yUSD'],
    ],
  }

const yusd_config = {
    ethereum: "0x19Ebd191f7A24ECE672ba13A302212b5eF7F35cb", 
    optimism: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    arbitrum: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    base: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    sonic: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    plume_mainnet: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
}

const vyusd_config = {
    ethereum: "0x2e3C5e514EEf46727DE1FE44618027A9b70D92FC", 
    optimism: '0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de',
    arbitrum: '0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de',
    base: '0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de',
    sonic: '0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de',
    plume_mainnet: '0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de',
}

const lockbox = "0x659b5bc7F2F888dB3D5901b78Cdb34DF270E2231";

const l2Chains = Object.keys(yusd_config).filter(chain => chain !== 'ethereum')

l2Chains.forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => api.add([yusd_config[chain], vyusd_config[chain]], await api.multiCall({ calls: [yusd_config[chain], vyusd_config[chain]], abi: 'erc20:totalSupply' }))
    }
});

module.exports['ethereum'] = {
    tvl: async (api) => {
        const lockboxSupply = await api2.erc20.balanceOf({
            target: yusd_config['ethereum'],
            owner: lockbox
        })
        const lockboxSupplyVyusd = await api2.erc20.balanceOf({
            target: vyusd_config['ethereum'],
            owner: lockbox
        })
        try {
            const ethSupply = await api.multiCall({ calls: [yusd_config['ethereum'], vyusd_config['ethereum']], abi: 'erc20:totalSupply' })
            const supply = (ethSupply[0] - lockboxSupply.output);
            const supplyVyusd = (ethSupply[1] - lockboxSupplyVyusd.output);
            api.add([yusd_config['ethereum'], vyusd_config['ethereum']], [supply, supplyVyusd]);
        } catch (e) {
            console.log(e)
        } 
    }
}