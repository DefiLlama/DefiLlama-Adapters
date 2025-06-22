const { compoundExports2 } = require('../helper/compound')
const comptroller = "0x0f390559f258eb8591c8e31cf0905e97cf36ace2"

module.exports = {
    hallmarks: [
        // [1647302400, "Reentrancy attack"],
        [1681541920, "Protocol hacked (oc Optimism)"],

    ],
    ethereum: compoundExports2({ comptroller, cether: '0xfcd8570ad81e6c77b8d252bebeba62ed980bd64d' }),
    arbitrum: compoundExports2({ comptroller, cether: '0x8e15a22853a0a60a0fbb0d875055a8e66cff0235' }),
    fantom: compoundExports2({ comptroller, cether: '0xfCD8570AD81e6c77b8D252bEbEBA62ed980BD64D' }),
    harmony: compoundExports2({ comptroller, cether: '0xbb93c7f378b9b531216f9ad7b5748be189a55807' }),
    moonriver: compoundExports2({ comptroller: "0x7d166777bd19a916c2edf5f1fc1ec138b37e7391", cether: '0xd6fcbccfc375c2c61d7ee2952b329dceba2d4e10' }),
    xdai: compoundExports2({ comptroller: "0x6bb6ebCf3aC808E26545d59EA60F27A202cE8586", cether: '0x6edcb931168c9f7c20144f201537c0243b19dca4' }),
    polygon: compoundExports2({ comptroller: "0xedba32185baf7fef9a26ca567bc4a6cbe426e499", cether: '0xEbd7f3349AbA8bB15b897e03D6c1a4Ba95B55e31' }),
    optimism: compoundExports2({ comptroller: "0x5a5755E1916F547D04eF43176d4cbe0de4503d5d", cether: '0x1A61A72F5Cf5e857f15ee502210b81f8B3a66263' }),
}

module.exports.optimism.borrowed = () => ({})
