const { usdCompoundExports } = require('../helper/compound')

const comptroller = "0x0b7a0EAA884849c6Af7a129e899536dDDcA4905E"
const chain = "moonriver"
const mMOVR = "0x6a1A771C7826596652daDC9145fEAaE62b1cd07f"

module.exports = {
  moonriver: usdCompoundExports(
    comptroller,
    chain,
    mMOVR,
  ),
}