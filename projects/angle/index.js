const sdk = require("@defillama/sdk")
const BigNumber = require('bignumber.js')
const {pool2s} = require('../helper/pool2')
const {staking} = require('../helper/staking')

// Registry will be released in next sdk of Angle + graphql endpoint to come
const collaterals = {
    'dai': '0x6b175474e89094c44da98b954eedeac495271d0f', 
    'usdc': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 
    'frax': '0x853d955acef822db058eb8505911ed77f175b99e', 
    'fei': '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', 
}
const agEUR = {
    contract: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8', 
    stableMasterFront: '0x5adDc89785D75C86aB939E9e15bfBBb7Fc086A87',
    poolManagers: {
        'dai': '0xc9daabC677F3d1301006e723bD21C60be57a5915', // DAI
        'usdc': '0xe9f183FC656656f1F17af1F2b0dF79b8fF9ad8eD', // USDC
        'fei': '0x53b981389Cfc5dCDA2DC2e903147B5DD0E985F44', // FEI
        'frax': '0x6b4eE7352406707003bC6f6b96595FD35925af48', // FRAX
    }
}
const agTokens = [agEUR]

const poolManagers_abi = { 
    "getTotalAsset": {
      "inputs": [],
      "name": "getTotalAsset",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    }
}
  
async function tvl(timestamp, block, chainBlocks) {
    // Building the api calls using the poolManager object of each agToken. Could also read the poolManager.token() but abi not yet available
    const poolManagersBalanceOf_calls = agTokens.map(t => {
        return Object.entries(t.poolManagers).map( ([key, value]) => ({ target: collaterals[key], params: value}))
    }).flat()
    /*
    // Call erc20:balanceOf only gets available assets and not those lent to strategies
    let collateralBalances = await sdk.api.abi.multiCall({
        calls: poolManagers_calls,
        abi: 'erc20:balanceOf',
        block: chainBlocks['ethereum'],
        chain: 'ethereum'
    })
    //const balances = {}
    //sdk.util.sumMultiBalanceOf(balances, collateralBalances)
    */
   
    const poolManagersTotalAsset_calls = agTokens.map(t => {
        return Object.entries(t.poolManagers).map( ([key, value]) => ({ target: value}))
    }).flat()
    let collateralBalances = await sdk.api.abi.multiCall({
        calls: poolManagersTotalAsset_calls,
        abi: poolManagers_abi['getTotalAsset'],
        block: chainBlocks['ethereum'],
        chain: 'ethereum'
    })

    // Accumulate collateral to balances
    const balances = {}
    collateralBalances.output.forEach(bal => {
        const token = poolManagersBalanceOf_calls.find(t => bal.input.target == t.params).target
        balances[token] = BigNumber(balances[token] || 0).plus(BigNumber(bal.output)).toFixed();
    })

    return balances
}

// Pool2 staking 
const stk_agEUR = '0xb1f2a25ffb2b095e99f430caf507cc31f9a3eaab' 
const stk_sanUSDC_EUR = '0x2fa1255383364f6e17be6a6ac7a56c9acd6850a3' 
const stk_sanDAI_EUR = '0x65e4992250b296790c07fadf0f0723902a07e91d' 
const stk_sanFRAX_EUR = '0xbb9485e2b9b0da40db3874a144700e31bd9c40c2' 
const stk_sanFEI_EUR = '0x3d7e670d105e8fbcae3bf2bfc54324302cdb6ad5' 
const stk_FEI_agEUR  = '0x98fdbc5497599eff830923ea1ee152adb9a4cea5'
const stk_FRAX_agEUR = '0x4121a258674e507c990cdf390f74d4ef27592114'
const stk_agEUR_FEI_univ2 = '0xbcb307f590972b1c3188b7916d2969cf75309dc6' 
const stk_agEUR_ANGLE_sushi = '0xa86cc1ae2d94c6ed2ab3bf68fb128c2825673267' 
const stk_agEUR_USDC_gelato  = '0xd97f480266b8c220929efdf9b00d72e94fa1f7d1'
// Pool2 LP
const agEUR_ = '0x1a7e4e63778b4f12a199c062f3efdd288afcbce8' 
const sanUSDC_EUR = '0x9c215206da4bf108ae5aeef9da7cad3352a36dad'
const sanDAI_EUR = '0x7b8e89b0ce7bac2cfec92a371da899ea8cbdb450'
const sanFRAX_EUR = '0xb3b209bb213a5da5b947c56f2c770b3e1015f1fe'
const sanFEI_EUR = '0x5d8d3ac6d21c016f9c935030480b7057b21ec804'
const FEI_agEUR  = '0x31429d1856ad1377a8a0079410b297e1a9e214c2'
const FRAX_agEUR = '0x31429d1856ad1377a8a0079410b297e1a9e214c2'
const agEUR_FEI_univ2 = '0xf89ce5ed65737da8440411544b0499c9fad323b2'    // staked-LP working
const agEUR_ANGLE_sushi = '0x1f4c763bde1d4832b3ea0640e66da00b98831355'  // staked-LP working
const agEUR_USDC_gelato  = '0x2bd9f7974bc0e4cb19b8813f8be6034f3e772add'
// pool2 arrays
let stakingContracts = [stk_agEUR, stk_sanFRAX_EUR, stk_sanFEI_EUR, stk_FRAX_agEUR, stk_FEI_agEUR, stk_sanDAI_EUR, stk_sanUSDC_EUR, stk_agEUR_FEI_univ2, stk_agEUR_USDC_gelato, stk_agEUR_ANGLE_sushi]
let lpTokens = [agEUR_, sanFRAX_EUR, sanFEI_EUR, FRAX_agEUR, FEI_agEUR, sanDAI_EUR, sanUSDC_EUR, agEUR_FEI_univ2, agEUR_USDC_gelato, agEUR_ANGLE_sushi]
stakingContracts = [stk_sanUSDC_EUR]
lpTokens = [sanUSDC_EUR]

module.exports = {
    ethereum: {
        tvl: () => ({}), 
        pool2: pool2s(stakingContracts, lpTokens, "ethereum"),
        staking: staking(stk_agEUR, agEUR_, "ethereum")
    },
    methodology: `TVL is retrieved on chain by querying balances of collaterals held by poolManagers of each agToken stablecoin (not only balanceOf which returns available assets, but getTotalAssets which also accounts for assets lent to strategies). Graph endpoint soon available. Otherwise could be approximated by the totalMintedStablecoins, agToken.totalSupply multiplied by the collateral ratio, stableMaster.getCollateralRatio. `, 
}