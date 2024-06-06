const {usdCompoundExports} = require('../helper/compound')

const unitroller_fantom = "0x892701d128d63c9856A9Eb5d967982F78FD3F2AE"

const abis = {
    oracle: "address:getRegistry",
    underlyingPrice: "function getPriceForUnderling(address cToken) view returns (uint256)",
  }


module.exports={
            fantom:usdCompoundExports(unitroller_fantom, "fantom", "0xed8F2C964b47D4d607a429D4eeA972B186E6f111", abis)
}