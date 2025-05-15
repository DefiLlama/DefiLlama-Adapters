const { api2 } = require("@defillama/sdk");


module.exports = {
    hallmarks: [
      [Math.floor(new Date('2025-05-02')/1e3), 'Launched v2 yUSD'],
    ],
  }

const config = {
    ethereum: "0x19Ebd191f7A24ECE672ba13A302212b5eF7F35cb", 
    optimism: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    arbitrum: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    base: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
}

const lockbox = "0x659b5bc7F2F888dB3D5901b78Cdb34DF270E2231";

const l2Chains = Object.keys(config).filter(chain => chain !== 'ethereum')

l2Chains.forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: config[chain] })
            api.add(config[chain], supply)
        }
    }
});

module.exports['ethereum'] = {
    tvl: async (api) => {
        const lockboxSupply = await api2.erc20.balanceOf({
            target: config['ethereum'],
            owner: lockbox
        })
        const ethSupply = await api.call({ abi: 'erc20:totalSupply', target: config['ethereum'] })
        const supply = (ethSupply - lockboxSupply.output);
        api.add(config['ethereum'], supply);
    }
}