// cian yield layer
const config = {
    ethereum: [
        "0xB13aa2d0345b0439b064f26B82D8dCf3f508775d",
        "0xd87a19fF681AE98BF10d2220D1AE3Fbd374ADE4e",
        "0x9fdDAD44eD6b77e6777dC1b16ee4FCcCBaF0A019",
        "0x6c77bdE03952BbcB923815d90A73a7eD7EC895D1",
        "0xcc7E6dE27DdF225E24E8652F62101Dab4656E20A",
        "0xd4Cc9b31e9eF33E392FF2f81AD52BE8523e0993b",
        "0x3D086B688D7c0362BE4f9600d626f622792c4a20",
    ],
    arbitrum: ["0x15cbFF12d53e7BdE3f1618844CaaEf99b2836d2A"],
};

module.exports = {
    doublecounted: true,
};

Object.keys(config).forEach((chain) => {
    module.exports[chain] = {
        tvl: async (api) =>  api.erc4626Sum({ calls: config[chain], isOG4626: true, permitFailure: true })
    };
});
