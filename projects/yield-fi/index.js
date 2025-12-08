const { api2 } = require("@defillama/sdk");

const yusd_config = {
    ethereum: "0x19Ebd191f7A24ECE672ba13A302212b5eF7F35cb", 
    optimism: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    arbitrum: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    base: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    sonic: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    plume_mainnet: '0x4772D2e014F9fC3a820C444e3313968e9a5C8121',
    katana: "0x4772D2e014F9fC3a820C444e3313968e9a5C8121",
    bsc: "0x4772D2e014F9fC3a820C444e3313968e9a5C8121",
    avax: "0x4772D2e014F9fC3a820C444e3313968e9a5C8121",
    tac: "0x4772D2e014F9fC3a820C444e3313968e9a5C8121",
    linea: "0x4e559dBCCbe87De66c6a9F3f25231096F24c2e28",
    plasma: "0x4772D2e014F9fC3a820C444e3313968e9a5C8121",
    saga: "0x839e7e610108Cf3DCc9b40329db33b6E6bc9baCE",
}

const vyusd_config = {
    ethereum: "0x2e3C5e514EEf46727DE1FE44618027A9b70D92FC", 
    optimism: '0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de',
    arbitrum: '0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de',
    base: '0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de',
    sonic: '0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de',
    plume_mainnet: '0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de',
    katana: "0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de",
    bsc: "0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de",
    avax: "0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de",
    tac: "0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de",
    linea: "0x168BC4DB5dcbecA279983324d3082c47e47569E7",
    plasma: "0xF4F447E6AFa04c9D11Ef0e2fC0d7f19C24Ee55de",
    saga: "0x704a58f888f18506C9Fc199e53AE220B5fdCaEd8",
}

const yeth_config = {
    ethereum: "0x8464F6eCAe1EA58EC816C13f964030eAb8Ec123A",
    arbitrum: "0x1F52Edf2815BfA625890B61d6bf43dDC24671Fe8",
    base: "0x1F52Edf2815BfA625890B61d6bf43dDC24671Fe8",
    saga: "0xA6F89de43315B444114258f6E6700765D08bcd56",
}

const vyeth_config = {
    ethereum: "0x3073112c2c4800b89764973d5790ccc7fba5c9f9",
    arbitrum: "0x8c93a6752Bfe29FDA26EbA8df4390c642e6A7f90",
    base: "0x8c93a6752Bfe29FDA26EbA8df4390c642e6A7f90"
}

const ybtc_config = {
    ethereum: "0xa01200b2e74DE6489cF56864E3d76BBc06fc6C43",
}

const vybtc_config = {
    ethereum: "0x1e2a5622178f93EFd4349E2eB3DbDF2761749e1B",
}

const lockbox = "0x659b5bc7F2F888dB3D5901b78Cdb34DF270E2231";

const l2Chains = Object.keys(yusd_config).filter(chain => chain !== 'ethereum')

l2Chains.forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            const calls = [
                yusd_config[chain],
                vyusd_config[chain],
                yeth_config[chain],
                vyeth_config[chain],
                ybtc_config[chain],
                vybtc_config[chain],
            ].filter(Boolean)
            const supply = await api.multiCall({ calls, abi: 'erc20:totalSupply' })
            api.add(calls, supply);
        }
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
        const lockboxSupplyYeth = await api2.erc20.balanceOf({
            target: yeth_config['ethereum'],
            owner: lockbox
        })
        const lockboxSupplyVyeth = await api2.erc20.balanceOf({
            target: vyeth_config['ethereum'],
            owner: lockbox
        })
        const lockboxSupplyYbtc = await api2.erc20.balanceOf({
            target: ybtc_config['ethereum'],
            owner: lockbox
        })
        const lockboxSupplyVybtc = await api2.erc20.balanceOf({
            target: vybtc_config['ethereum'],
            owner: lockbox
        })
        const ethSupply = await api.multiCall({ calls: [yusd_config['ethereum'], vyusd_config['ethereum'], yeth_config['ethereum'], vyeth_config['ethereum'], ybtc_config['ethereum'], vybtc_config['ethereum']], abi: 'erc20:totalSupply' })
        const supply = (ethSupply[0] - lockboxSupply.output);
        const supplyVyusd = (ethSupply[1] - lockboxSupplyVyusd.output);
        const supplyYeth = (ethSupply[2] - lockboxSupplyYeth.output);
        const supplyVyeth = (ethSupply[3] - lockboxSupplyVyeth.output);
        const supplyYbtc = (ethSupply[4] - lockboxSupplyYbtc.output);
        const supplyVybtc = (ethSupply[5] - lockboxSupplyVybtc.output);
        api.add([yusd_config['ethereum'], vyusd_config['ethereum'], yeth_config['ethereum'], vyeth_config['ethereum'], ybtc_config['ethereum'], vybtc_config['ethereum']], [supply, supplyVyusd, supplyYeth, supplyVyeth, supplyYbtc, supplyVybtc]);
    }
}