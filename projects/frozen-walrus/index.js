const wlrTokenAddress = "0x395908aeb53d33A9B8ac35e148E9805D34A555D3";
const wshareTokenAddress = "0xe6d1aFea0B76C8f51024683DD27FA446dDAF34B6";
const masonryAddress = "0x38B0b6Ef43c4262659523986D731f9465F871439";
const treasuryAddress = "0xDb8618e899FD9fa4B8E6DBd1E00BCA89E4DaF9cd";
const rewardPool = '0x752FEacFdA5c3B440Fd6D40ECf338a86b568c2d2'
const chain = 'avax'
const { tombTvl } = require('../helper/tomb');

const ftmLPs = [
    "0x82845B52b53c80595bbF78129126bD3E6Fc2C1DF", // tombFtmLpAddress
    "0x03d15E0451e54Eec95ac5AcB5B0a7ce69638c62A", //tshareFtmLpAddress
];

module.exports = {
  ...tombTvl(wlrTokenAddress, wshareTokenAddress, rewardPool, masonryAddress, ftmLPs, chain, undefined, true, ftmLPs[1])
};