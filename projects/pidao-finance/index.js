const treasury = "0x458B737d87C40252EC11b160C76bb1C53F248b28"
module.exports = ohmTvl(treasury, [
    //busd 
    ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false],
    //busd-usd
    ["0x55d398326f99059ff775485246999027b3197955", false],
    //TrueUSD
    ["0x14016e85a25aeb13065688cafb43044c2ef86784", false],
    //MDEX LP
    ["0x149a712378aba63882c1d372739eb47a6fd0e12e", true],
    //Pancake LPs
    ["0x3991e0988a69e4c8fde46c011dafe55e26fdd18d", true],
    //Pancake LPs 1
    ["0xc0d02c7fc87e50a6580c4091d9d76bb7e38b05b8", true],
], "bsc", "0x22d1704817D42bdE262d778bFE097e287151371D", "0x1215ed20aa507578ca352e195016f289e7a17f3a")