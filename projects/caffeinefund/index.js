const { tombTvl } = require('../helper/tomb');

const cfn = "0x3873788Acb34a7d67e90F053da8598aEF76298c6";
const cshare = "0x41160139986dFfE2011a07fbB5F4B316200A5419";

const boardroom = "0xf916Dc7bfEAd1cA29cB1aCE71D82dFF68Cc12291";
const rewardPool = "0x803b87cC88B701E4F871939826944e1d0413747c";

const pool2lps = [
    "0x504183690063734eAAd4f53b77729266b28E3b60",
    "0x190a83FdaC8560d0e6ED2ab00dDE62D648A46747"
]

module.exports = {
    ...tombTvl(cfn, cshare, rewardPool, boardroom, pool2lps, "avax", undefined, false, pool2lps[1])
}