const ADDRESSES = require('../helper/coreAssets.json')

const dUSDCollateralVault = "0x624E12dE7a97B8cFc1AD1F050a1c9263b1f4FeBC"

async function getAMOTvl(api) {
  const fraxDUSDCurveLP = '0x9CA648D2f51098941688Db9a0beb1DadC2D1B357'
  const fraxDUSDCurveLPBal = await api.call({ abi: 'erc20:balanceOf', target: fraxDUSDCurveLP, params: '0x0B0BD5F8A6f4c72a09748fA915Af12Ca423B7240' })
  const fraxDUSDCurveLPFraxBal = await api.call({ abi: 'erc20:balanceOf', params: fraxDUSDCurveLP, target: ADDRESSES.fraxtal.FRAX })
  const fraxDUSDCurveLPSupply = await api.call({ abi: 'erc20:totalSupply', target: fraxDUSDCurveLP, })
  const fraxBal = fraxDUSDCurveLPFraxBal * fraxDUSDCurveLPBal / fraxDUSDCurveLPSupply
  api.add(ADDRESSES.fraxtal.FRAX, fraxBal)
}

const tvl = async (api) => {
  await getAMOTvl(api)

  const tokens = await api.call({ abi: 'address[]:listCollateral', target: dUSDCollateralVault })
  return api.sumTokens({ owner: dUSDCollateralVault, tokens })
}

module.exports = {
  methodology: 'Includes TVL for dLEND and TVL for dUSD.',
  fraxtal: {
    tvl,
  }
};