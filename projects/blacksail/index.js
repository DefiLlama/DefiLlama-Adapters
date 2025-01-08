const { get } = require('../helper/http')
const { sumUnknownTokens } = require('../helper/unknownTokens')

async function fetcher() {
  const response = await get('https://api.blacksail.finance/stats');
  return response;
}

const strats = [
  "0x11d58E28048132957FA344Be0Ae3FaE56bA185d2", "0x197329445441dFa5B725eA654A6f910f7669e83f", "0x14E19a5d30E75e252F02f6cFD3985b1b5c64D298", "0x33f02985658B7E2763859154B92A97d90F8Ec7ad", "0xAc57B713C630f188bc2d95c2ae3C27A1DE1DebA1", "0xDBa26763C6DbA30891453897Ef0b85C3Ab126Bb7", "0x6506920CF039087792BE09066712F4dC2186C749", "0xba5eC23096D5579b2052aA77317167E2d905D84E", "0xBdfF1fFbBdA067416c10719804EAC95A49B84EE4", "0xb896e66473915157534C77e06925d88E5b42C057", "0xe15825c6a9e26F47b436b9c3bd76b79daDfd7075", "0x613662ED769c0313cF228d76Fb3863456B6D0C5a", "0x88BF4D8efF256eEaE1Ccc7D5A93f23d88EC178f4", "0x2D5016734838FDf467016c9EF649327FD4110c71", "0x79f28bebd165D2B884f90e60b1946154A58752f1", "0xF5F2A9Ae7673dc28A327684b023A89248F8E8318", "0x0149Ed6072b343E587718f5B82dE7F665E44E403", "0x32259E464d130479eE4cB2c3F375d21A401Ab129", "0x3bBf53067B7C596De32092C789C051f5284c50bD", "0xc48077cDdbD8AC80aC1E7e22D510480ba700cbd1", "0x14A8B80078b818E62A53B39781C357610EC3C16F", "0xC84FcDF81b86D817A28d046eA89752030f6c1c4d", "0x491612ACe7d4ccd255fC5D08710ABF1b666a77DF", "0x4D6C1b29FD117790b8dA064d259821154fe99a42", "0x41b3407e368F96f58645543Bce307493631e303B", "0x30f10efC192BC2095f9085199F3916Cd043b2d44", "0xba6b2bb02854E174Ab9B995261B447154EAbd10a", "0x9Fb4B224Ab74DeB01899C4CdBC037419e2700aCF", "0x96c2BCed606bdddb1f1f0BAfe6a5dc8d746F8484", "0x1175D5fF8fA3cC545eAEb9697eB20237873281B3", "0x4d8C24Ab68B5C32c38BC39ab841B6cCE454C03aD", "0x4f796426B6d8cD98cE814837e03eCa4e8D66Dff3", "0x174A963186BB90852461D189035eB923f6fCc838", "0xAC76a4714f08F04F32DF75D647979f2660239078", "0x978526df622cE9b02b5A32f4D76C73d066b72FEb", "0x33B1C16403fF2BFbA0508e15eAEA58BDA1eDc48C", "0xe8F694512973eBE7D6FDA181872e6Ffb1B7eaB5c"
]

async function tvl(api) {
  const bals = await api.multiCall({ abi: 'uint256:balanceOf', calls: strats })
  const tokens = await api.multiCall({ abi: 'address:staking_token', calls: strats })
  const symbols = await api.multiCall({ abi: 'string:symbol', calls: tokens })
  const ichiVaults = []
  const ichiBals = []
  tokens.forEach((token, i) => {
    if (symbols[i] === 'ICHI_Vault_LP') {
      ichiVaults.push(token)
      ichiBals.push(bals[i])
    } else
      api.add(token, bals[i])
  })

  // resolve ichi vaults
  const iSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: ichiVaults })
  const iToken0s = await api.multiCall({ abi: 'address:token0', calls: ichiVaults })
  const iToken1s = await api.multiCall({ abi: 'address:token1', calls: ichiVaults })
  const iTokenBals = await api.multiCall({ abi: 'function getTotalAmounts() view returns (uint256 bal1, uint256 bal2)', calls: ichiVaults })

  iSupplies.map((_, i) => {
    const token0 = iToken0s[i]
    const token1 = iToken1s[i]
    const ratio = ichiBals[i] / iSupplies[i]
    api.add(token0, iTokenBals[i].bal1 * ratio)
    api.add(token1, iTokenBals[i].bal2 * ratio)
  })

  return sumUnknownTokens({ api, useDefaultCoreAssets: true, lps: tokens.filter((_, i) => symbols[i].startsWith('v-')), resolveLP: true, allLps: true, })
}

module.exports = {
  sonic: {
    tvl,
  }
}