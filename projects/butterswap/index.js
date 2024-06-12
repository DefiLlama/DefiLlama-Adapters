const {uniTvlExport} = require("../helper/unknownTokens");
const {staking} = require("../helper/staking");

//HECO ADDRESSES
const hecoFactory = "0x874D01CA682C9c26BA7E6D9f6F801d1a1fb49201";
const hecoButter = "0xbf84214ea409A369774321727595F218889eD943";
const hecoChef = "0x89a3BfA840CF4C9022789CC60500Ec03df8C2935";

//BSC ADDRESSES
const bscFactory = "0x1Ba94C0851D96b2c0a01382Bf895B5b25361CcB2";
const bscButter = "0x5eF7814f4cB17b38408F1F641e4b5b61c5D023a8";
const bscHButter = "0x2f3bca2631fff538b8a55207f6c2081457e229f7";
const bscChef = "0xa49f4CF57eaFE0098D398DF3eD3A7dF10EAaBfAB";

module.exports = {
    heco: {
        tvl: uniTvlExport('heco', hecoFactory).heco.tvl,
        staking: staking(hecoChef, hecoButter),
    },
    bsc: {
        tvl: uniTvlExport('bsc', bscFactory).bsc.tvl,
        staking: staking(bscChef, bscButter),
    },
}