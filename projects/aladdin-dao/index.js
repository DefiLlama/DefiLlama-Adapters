const { sumTokens2 } = require("../helper/unwrapLPs")

const vaultABI = {
  "balance": "uint256:balance"
}


const tokenMaster = '0xfF4446E9dF1c8281CE1d42610c3bC0342f93E4d7'
const aldsETH = '0xB17d98c36d2238Ffcb27bF797cA9967B3Cc9Aa07'
const aldcrvRenWBTC = '0x4EE014060F4816ad294857d29C22fe62B0e9580B'
const ald3CRV = '0x5C8dC3a18761e4F22F7B8D41228970477168d9e2'
const aldSLPETHWBTC = '0x1C7ed66abE1BA029c8EFceecfBfc4056B8C4bbfc'
const unilpALDETH = '0xED6c2F053AF48Cba6cBC0958124671376f01A903'
const unilpALDUSDC = '0xaAa2bB0212Ec7190dC7142cD730173b0A788eC31'
const crvRenWBTC = '0x49849C98ae39Fff122806C06791Fa73784FB3675'
const SETH = '0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c'
const threeCRV = '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490'
const slpETHWBTC = '0xceff51756c56ceffca006cd410b03ffc46dd3a58'

const pools = [aldcrvRenWBTC, aldsETH, ald3CRV, aldSLPETHWBTC, unilpALDETH, unilpALDUSDC]
const aldVaults = [aldcrvRenWBTC, aldsETH, ald3CRV, aldSLPETHWBTC]
const aldVaultUnderlyingTokens = [crvRenWBTC, SETH, threeCRV, ];

async function tvl(api) {
  const lockedTokens = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: pools.map(p => ({
      target: p,
      params: tokenMaster
    })),
  });

  // whether it's in vaults or in staking, it belongs to aladdin's tvl
  const aldUnderlyingTokenBalances = await api.multiCall({    abi: vaultABI['balance'],    calls: aldVaults,  })

  const crvBalances = [];

  lockedTokens.forEach((call, index) => {
    const token = pools[index];
    const balance= call;
    if (index === 4 || index === 5) {
      api.add(token, balance)
    } else if (index === 0 || index == 1 || index == 2 ) {
      crvBalances.push(aldUnderlyingTokenBalances[index])
    } else if (index === 3) {
      api.add(slpETHWBTC, aldUnderlyingTokenBalances[index])
    }
  })

  api.add(aldVaultUnderlyingTokens, crvBalances)
  return sumTokens2({ api, resolveLP: true, })
}


module.exports = {
  doublecounted: true,
  ethereum:{
    tvl,
  },
}
