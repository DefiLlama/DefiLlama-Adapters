const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, genericUnwrapCvx } = require('../helper/unwrapLPs')

const treasuries = ["0xa52fd396891e7a74b641a2cb1a6999fcf56b077e", "0x086c98855df3c78c6b481b6e1d47bef42e9ac36b"]

const cvxCRVStaking = '0x3Fe65692bfCD0e6CF84cB1E7d24108E434A7587e'
const CVX = ADDRESSES.ethereum.CVX
const cvxCRV = ADDRESSES.ethereum.cvxCRV
const FXS = ADDRESSES.ethereum.FXS
const veFXS = '0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0'
const CRV = ADDRESSES.ethereum.CRV
const veCRV = '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2'
const sOHM = '0x04906695D6D12CF5459975d7C3C03356E4Ccd460'
const OHM = '0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5'
const AURA = '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF'
const AURALocker = '0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC'
const rlBTRFLY = '0x742B70151cd3Bc7ab598aAFF1d54B90c3ebC6027'
const BTRFLYV2 = '0xc55126051B22eBb829D00368f4B12Bde432de5Da'
const cvxCRVPool = '0x0392321e86F42C2F94FBb0c6853052487db521F0'

const rlBTRFLYAbi = {
  lockedSupply: "uint256:lockedSupply",
}

async function tvl(api) {
  const block = api.block
  const balances = api.getBalances()
  const tokens = [
    CVX,
    cvxCRV,
    FXS,
    CRV,
    AURA,
    // BTRFLY/ETH Curve LP
    '0x7483Dd57f6488b0e194A151C57Df6Ec85C00aCE9',
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.FRAX,
  ]

  //Add tokens/curve LPs in wallet
  await api.sumTokens({ owners: treasuries, tokens })

  //Add UniswapV3 LPs
  await sumTokens2({ api, owners: treasuries, resolveUniV3: true, })

  //Add convex deposited curve LPs
  await genericUnwrapCvx(balances, treasuries[0], cvxCRVPool, block)

  //This causes an error and not sure why
  //await genericUnwrapCvx(balances, treasuries[0], cvxFXSPool, block, 'ethereum')

  //Add vlCVX as CVX
  const [vlCVXBalance, vlAURABalance, cvxCRVStakedBalance, veFXSBalance, veCRVBalance, sOHMBalance] = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: [
      { target: ADDRESSES.ethereum.vlCVX, params: treasuries[0] },
      { target: AURALocker, params: treasuries[0] },
      { target: cvxCRVStaking, params: treasuries[0] },
      { target: veFXS, params: treasuries[0] },
      { target: veCRV, params: treasuries[0] },
      { target: sOHM, params: treasuries[1] },
    ]
  })
  api.add(CVX, vlCVXBalance)
  api.add(AURA, vlAURABalance)
  api.add(cvxCRV, cvxCRVStakedBalance)
  api.add(CRV, veCRVBalance)
  api.add(OHM, sOHMBalance)
  api.add(FXS, veFXSBalance / 4)
  //Add vlAURA as AURA
  //Add staked cvxCRV as cvxCRV
  //Add veFXS as  1/4 FXS since locked for 4 years
  //Add veCRV as 1 CRV since locked for 4 years
  //Add sOHM as OHM since 1:1
}

async function staking(api) {

  //Adding locked BTRFLY
  const lockedBTRFLY = await api.call({    abi: rlBTRFLYAbi.lockedSupply,    target: rlBTRFLY,  })
  api.add(BTRFLYV2, lockedBTRFLY)
}

module.exports = {
  methodology: "tvl = Treasury assets (bonding). staking = rlBTRFLY (locked tokens)",
  ethereum: {
    tvl,
    staking
  },
}