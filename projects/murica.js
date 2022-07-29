const { tombTvl } = require('./helper/tomb');

const bond = "0xeb3bA75334A58cB80C45dfBb551f03A5FdE452E6";
const share = "0x19F72Ffe6f5388523FDc30d785eF79E8132cfFF8";
const boardroom = "0xbE621f15e7e58e606D1226BCC192646f03e79C58";
const rewardPool = "0x5f137cb2e183BE293bc49ca770B6D11E07926D58";
const pool2lps = [
    "0x38c1aff09b3d759eddac307cc1f74b55ed54177d",
    "0x314edd39c85a76d0c255813c15097e5afc892074",
];

module.exports = {
    ...tombTvl(bond, share, rewardPool, boardroom, pool2lps, "fantom", undefined, false, pool2lps[1])
};