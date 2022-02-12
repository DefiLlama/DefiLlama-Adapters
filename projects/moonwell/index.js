const { compoundExportsWithAsyncTransform } = require('../helper/compound')
const { transformMoonriverAddress } = require('../helper/portedTokens')

const comptroller = "0x8529ea4DBDcA738aA928d682ea9c1382Bf2Ff098"
const chain = "moonriver"
const mMOVR = "0x6a1A771C7826596652daDC9145fEAaE62b1cd07f"

module.exports = {
  moonriver: compoundExportsWithAsyncTransform(
    comptroller,
    chain,
    mMOVR,
    undefined,
    transformMoonriverAddress
  ),
}