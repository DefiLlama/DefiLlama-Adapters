const { usdCompoundExports } = require('../helper/compound');

const unitroller_fuse = "0x26a562B713648d7F3D1E1031DCc0860A4F3Fa340"

const abis = {
    oracle: "address:getRegistry",
    underlyingPrice: "function getPriceForUnderling(address cToken) view returns (uint256)",
}

const olalending = usdCompoundExports(unitroller_fuse, "fuse", "0x025B0ff0920298e087308F3b2de0CF6399685909", abis)
module.exports = {
    fuse:{
        tvl: olalending.tvl,
        borrowed: async function(timestamp, ...otherParams){
            if(timestamp >= 1648684800){
                return {}
            }
            return olalending.borrowed(timestamp, ...otherParams)
        }
    },
    hallmarks: [
    [1648684800, "Ola Finance exploit"]
  ]
}