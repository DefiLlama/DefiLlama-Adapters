const { compoundExports } = require('../helper/compound')

const soWETH = "0xf7B5965f5C117Eb1B5450187c9DcFccc3C317e8E"
const soDAI = "0x5569b83de187375d43FBd747598bfe64fC8f6436"
const soUSDC = "0xEC8FEa79026FfEd168cCf5C627c7f486D77b765F"
const soUSDT = "0x5Ff29E4470799b982408130EFAaBdeeAE7f66a10"
const soOP = "0x8cD6b19A07d754bF36AdEEE79EDF4F2134a8F571"
const soSUSD = "0xd14451E0Fa44B18f08aeB1E4a4d092B823CaCa68"
const unitroller = "0x60CF091cD3f50420d50fD7f707414d0DF4751C58"

const { tvl, borrowed } = compoundExports(
    unitroller, "optimism", soWETH, soDAI, soUSDC, soUSDT, soOP, soSUSD );

module.exports = {
    timetravel: true,
    doublecounted: false,
    methodology: "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
    optimism: { tvl, borrowed }
}