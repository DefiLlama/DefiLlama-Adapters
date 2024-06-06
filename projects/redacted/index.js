const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensAndLPsSharedOwners, sumTokens2, genericUnwrapCvx } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const treasuries = ["0xa52fd396891e7a74b641a2cb1a6999fcf56b077e", "0x086c98855df3c78c6b481b6e1d47bef42e9ac36b"]

const cvxCRVStaking = '0x3Fe65692bfCD0e6CF84cB1E7d24108E434A7587e'
const CVX = ADDRESSES.ethereum.CVX
const cvxCRV = ADDRESSES.ethereum.cvxCRV
const FXS = '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0'
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

async function tvl(timestamp, block, chainBlocks){
    const balances = {}
    
    //Add tokens/curve LPs in wallet
    await sumTokensAndLPsSharedOwners(balances, [
        [CVX, false],
        [cvxCRV, false],
        [FXS, false],
        [CRV, false],
        [AURA, false],
        // BTRFLY/ETH Curve LP
        ['0x7483Dd57f6488b0e194A151C57Df6Ec85C00aCE9', false],
        [ADDRESSES.ethereum.USDC, false],
        [ADDRESSES.ethereum.FRAX, false],
    ], treasuries, block)
    
    //Add UniswapV3 LPs
    await sumTokens2({ balances, owners: treasuries, block, resolveUniV3: true, })

    //Add convex deposited curve LPs
    await genericUnwrapCvx(balances, treasuries[0], cvxCRVPool, block, 'ethereum')
    
    //This causes an error and not sure why
    //await genericUnwrapCvx(balances, treasuries[0], cvxFXSPool, block, 'ethereum')
    
    //Add vlCVX as CVX
    const vlCVXBalance = await sdk.api.erc20.balanceOf({
        target: ADDRESSES.ethereum.vlCVX,
        owner: treasuries[0],
        chain: 'ethereum',
        block: chainBlocks['ethereum']
    }).then(result => result.output)
    sdk.util.sumSingleBalance(balances, CVX, vlCVXBalance)

    //Add vlAURA as AURA
    const vlAURABalance = await sdk.api.erc20.balanceOf({
        target: AURALocker,
        owner: treasuries[0],
        chain: 'ethereum',
        block: chainBlocks['ethereum']
    }).then(result => result.output)
    sdk.util.sumSingleBalance(balances, AURA, vlAURABalance)

    //Add staked cvxCRV as cvxCRV
    const cvxCRVStakedBalance = await sdk.api.erc20.balanceOf({
        target: cvxCRVStaking,
        owner: treasuries[0],
        chain: 'ethereum',
        block: chainBlocks['ethereum']
    }).then(result => result.output)
    sdk.util.sumSingleBalance(balances, cvxCRV, cvxCRVStakedBalance)

    //Add veFXS as  1/4 FXS since locked for 4 years
    const veFXSBalance = await sdk.api.erc20.balanceOf({
        target: veFXS,
        owner: treasuries[0],
        chain: 'ethereum',
        block: chainBlocks['ethereum']
    }).then(result => result.output)
    sdk.util.sumSingleBalance(balances, FXS, veFXSBalance/4)

    //Add veCRV as 1 CRV since locked for 4 years
    const veCRVBalance = await sdk.api.erc20.balanceOf({
        target: veCRV,
        owner: treasuries[0],
        chain: 'ethereum',
        block: chainBlocks['ethereum']
    }).then(result => result.output)
    sdk.util.sumSingleBalance(balances, CRV, veCRVBalance)

    //Add sOHM as OHM since 1:1
    const sOHMBalance = await sdk.api.erc20.balanceOf({
        target: sOHM,
        owner: treasuries[1],
        chain: 'ethereum',
        block: chainBlocks['ethereum']
    }).then(result => result.output)
    sdk.util.sumSingleBalance(balances, OHM, sOHMBalance)

    return balances
}

async function staking(timestamp, block, chainBlocks) {
    const balances = {}
    
    //Adding locked BTRFLY
    const lockedBTRFLY = await sdk.api.abi.call({
        abi: rlBTRFLYAbi.lockedSupply,
        target: rlBTRFLY,
        chain: 'ethereum',
        block: chainBlocks['ethereum'],
    }).then(result => result.output)
    sdk.util.sumSingleBalance(balances, BTRFLYV2, lockedBTRFLY)
    
    return balances
}

module.exports = {
        methodology: "tvl = Treasury assets (bonding). staking = rlBTRFLY (locked tokens)",
    ethereum:{
        tvl,
        staking
    },
}