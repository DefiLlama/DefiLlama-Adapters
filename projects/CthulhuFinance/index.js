const { sumUnknownTokens } = require("../helper/unknownTokens")

function vaultTvl(vaults) {
  return async (_, _b, _cb, { api, }) => {
    const [tokens, bals] = await Promise.all([
      api.multiCall({ abi: 'address:want', calls: vaults }),
      api.multiCall({ abi: 'uint256:balance', calls: vaults }),
    ])
    api.addTokens(tokens, bals)
    return sumUnknownTokens({ api, tokensAndOwners: [], useDefaultCoreAssets: true, lps: ['0xb220503db292a4d01fdb1725b95c0bdd734a6ce3'], resolveLP: true, })
  }
}

module.exports = {
  hallmarks: [
    [1679788800, "Rug Pull"]
  ],
  optimism: {
    tvl: vaultTvl([
      "0xF6a6C4573099E6F6b9D8E1186a2C089B4d0fDf91",
      "0x8296E2C3a78EdfEf9847F7Bcb6Cf57e09fDA5B83",
      "0xabd80105bb547904e5B33A41e84FFFCF1623f5A9",
      "0xeb2e04225D9a570eBd1C9577FfAF401ee076b7FD",
    ]),
    pool2: vaultTvl(['0xD61eE9E1991A22660FF10161926FF24B98Ad7918']),
    staking: vaultTvl(['0xFca7B025449373fdDE24acCA662304b36cFd26a8']),
  }
}

