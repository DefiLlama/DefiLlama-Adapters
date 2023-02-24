const abi = require('./abi.json')
const sdk = require('@defillama/sdk')
const { chainExports } = require('../helper/exports')
const { default: BigNumber } = require('bignumber.js')

const contracts = {
  ethereum:[
    '0xC8E6CA6E96a326dC448307A5fDE90a0b21fd7f80', // idleWETHYield
    '0x5C960a3DCC01BE8a0f49c02A8ceBCAcf5D07fABe', // idleRAIYield
    '0xb2d5CB72A621493fe83C6885E4A776279be595bC', // idleFEIYield
    '0x3fe7940616e5bc47b0775a0dccf6237893353bb4', // idleDAIYield
    '0x78751b12da02728f467a44eac40f5cbc16bd7934', // idleDAIYieldV3
    '0x5274891bEC421B39D23760c04A6755eCB444797C', // idleUSDCYield
    '0x12B98C621E8754Ae70d0fDbBC73D6208bC3e3cA6', // idleUSDCYieldV3
    '0xF34842d05A1c888Ca02769A633DF37177415C2f8', // idleUSDTYield
    '0x63D27B3DA94A9E871222CB0A32232674B02D2f2D', // idleUSDTYieldV3
    '0xf52cdcd458bf455aed77751743180ec4a595fd3f', // idleSUSDYield
    '0xe79e177d2a5c7085027d7c64c8f271c81430fc9b', // idleSUSDYieldV3
    '0xc278041fDD8249FE4c1Aad1193876857EEa3D68c', // idleTUSDYield
    '0x51C77689A9c2e8cCBEcD4eC9770a1fA5fA83EeF1', // idleTUSDYieldV3
    '0x8C81121B15197fA0eEaEE1DC75533419DcfD3151', // idleWBTCYield
    '0xD6f279B7ccBCD70F8be439d25B9Df93AEb60eC55', // idleWBTCYieldV3
    '0xa14ea0e11121e6e951e87c66afe460a00bcd6a16', // idleDAISafe
    '0x1846bdfDB6A0f5c473dEc610144513bd071999fB', // idleDAISafeV3
    '0x3391bc034f2935ef0e1e41619445f998b2680d35', // idleUSDCSafe
    '0xcDdB1Bceb7a1979C6caa0229820707429dd3Ec6C', // idleUSDCSafeV3
    '0x28fAc5334C9f7262b3A3Fe707e250E01053e07b5', // idleUSDTSafe
    '0x42740698959761baf1b06baa51efbd88cb1d862b', // idleUSDTSafeV3
    '0xDc7777C771a6e4B3A82830781bDDe4DBC78f320e', // idleUSDCBB
    '0xfa3AfC9a194BaBD56e743fA3b7aA2CcbED3eAaad' // idleUSDTBB
  ],
  polygon:[
    "0x8a999F5A3546F8243205b2c0eCb0627cC10003ab", // idleDAIYield
    "0x1ee6470CD75D5686d0b2b90C0305Fa46fb0C89A1", // idleUSDCYield
    "0xfdA25D931258Df948ffecb66b5518299Df6527C4" // idleWETHYield
  ]      
}

const trancheContracts = [
  "0xd0DbcD556cA22d3f3c142e9a3220053FD7a247BC", // DAI
  "0x77648a2661687ef3b05214d824503f6717311596", // FEI
  "0x34dcd573c5de4672c8248cd12a99f875ca112ad8", // stETH
  "0x70320A388c6755Fc826bE0EF9f98bcb6bCCc6FeA", // mUSD
  "0x4ccaf1392a17203edab55a1f2af3079a8ac513e7", // FRAX3CRV
  "0x151e89e117728ac6c93aae94c621358b0ebd1866", // MIM3CRV
  "0x7ecfc031758190eb1cb303d8238d553b1d4bc8ef", // steCRV
  "0x008c589c471fd0a13ac2b9338b69f5f7a1a843e1", // ALUSD3CRV
  "0x858F5A3a5C767F8965cF7b77C51FD178C4A92F05", // 3EUR
  "0x16d88C635e1B439D8678e7BAc689ac60376fBfA6", // MUSD3CRV
  "0xF87ec7e1Ee467d7d78862089B92dd40497cBa5B8", // MATIC
  "0xf324Dca1Dc621FCF118690a9c6baE40fbD8f09b7", // PBTCCRV
  "0xf5a3d259bfe7288284bd41823ec5c8327a314054", // IdleCDO_euler_USDC
  "0x46c1f702a6aad1fd810216a5ff15aab1c62ca826", // IdleCDO_euler_DAI
  "0xD5469DF8CA36E7EaeDB35D428F28E13380eC8ede", // IdleCDO_euler_USDT
  "0x2398Bc075fa62Ee88d7fAb6A18Cd30bFf869bDa4", // IdleCDO_euler_AGEUR
  "0xDBCEE5AE2E9DAf0F5d93473e08780C9f45DfEb93", // IdleCDO_clearpool_wintermute_USDC
  "0xDBd47989647Aa73f4A88B51f2B5Ff4054De1276a", // IdleCDO_clearpool_folkvang_USDC
  "0xDcE26B2c78609b983cF91cCcD43E238353653b0E", // IdleCDO_clearpool_DAI
  "0x4bC5E595d2e0536Ea989a7a9741e9EB5c3CAea33", // IdleCDO_ribbon_folkvang_USDC
  "0xf6B692CC9A5421E4C66D32511d65F94c64fbD043", // IdleCDO_ribbon_wintermute_USDC
  "0xc8c64CC8c15D9aa1F4dD40933f3eF742A7c62478", // IdleCDO_ribbon_DAI
  "0x1f5A97fB665e295303D2F7215bA2160cc5313c8E", // IdleCDO_truefi_USDC
  "0xf615a552c000B114DdAa09636BBF4205De49333c", // IdleCDO_Euler_USDCStaking
  "0x860B1d25903DbDFFEC579d30012dA268aEB0d621", // IdleCDO_Euler_USDTStaking
  "0xec964d06cD71a68531fC9D083a142C48441F391C", // IdleCDO_euler_WETHStaking
  "0x264E1552Ee99f57a7D9E1bD1130a478266870C39", // IdleCDO_euler_DAIStaking
];

const trancheTokenUnderlying = {
  "0x6b175474e89094c44da98b954eedeac495271d0f":"0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
  "0x956f47f50a910163d8bf957cf5846d573e7f87ca":"0x956f47f50a910163d8bf957cf5846d573e7f87ca", // FEI
  "0xae7ab96520de3a18e5e111b5eaab095312d7fe84":"0xae7ab96520de3a18e5e111b5eaab095312d7fe84", // stETH
  "0xe2f2a5c287993345a840db3b0845fbc70f5935a5":"0xe2f2a5c287993345a840db3b0845fbc70f5935a5", // mUSD
  "0xd632f22692fac7611d2aa1c0d552930d43caed3b":"0xd632f22692fac7611d2aa1c0d552930d43caed3b", // FRAX3CRV
  "0x5a6a4d54456819380173272a5e8e9b9904bdf41b":"0x5a6a4d54456819380173272a5e8e9b9904bdf41b", // MIM3CRV
  "0x06325440d014e39736583c165c2963ba99faf14e":"0x06325440d014e39736583c165c2963ba99faf14e", // steCRV
  "0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c":"0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c", // ALUSD3CRV
  "0xb9446c4ef5ebe66268da6700d26f96273de3d571":"0xb9446c4ef5ebe66268da6700d26f96273de3d571", // 3EUR
  "0x1aef73d49dedc4b1778d0706583995958dc862e6":"0x1aef73d49dedc4b1778d0706583995958dc862e6", // MUSD3CRV
  "0xc9467e453620f16b57a34a770c6bcebece002587":"0xc9467e453620f16b57a34a770c6bcebece002587", // PBTCCRV
  "0x1a7e4e63778b4f12a199c062f3efdd288afcbce8":"0x1a7e4e63778b4f12a199c062f3efdd288afcbce8", // AGEUR
  "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0":"0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", // MATIC
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "0xdac17f958d2ee523a2206206994597c13d831ec7":"0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2":"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
};

function chainTvl(chain){
  return async (time, ethBlock, chainBlocks)=>{   
    const block = chainBlocks[chain];
    const calls = {
      chain,
      block,
      calls: contracts[chain].map(c=>({target:c}))
    };
    const [tokenPrice, token, supply] = await Promise.all([abi.tokenPrice, abi.token, "erc20:totalSupply"].map(abi=>
      sdk.api.abi.multiCall({
        abi,
        ...calls,
      }))
    );
    const balances = {};
    tokenPrice.output.forEach((price, i)=>{
      sdk.util.sumSingleBalance(balances, chain+":"+ token.output[i].output,
      BigNumber(price.output).times(supply.output[i].output).div(1e18).toFixed(0))
    })
    if (chain==="ethereum"){
      const [contractValue, trancheToken] = await Promise.all([abi.getContractValue, abi.token].map(abi=>
        sdk.api.abi.multiCall({
          abi,
          block, chain,
          calls: trancheContracts.map(c=>({target:c}))
        }))
      );

      contractValue.output.forEach((value, i)=>{
        sdk.util.sumSingleBalance(balances, chain+":"+ trancheTokenUnderlying[trancheToken.output[i].output.toLowerCase()], value.output)
      })
    }
    return balances;
  }
}

module.exports=chainExports(chainTvl, Object.keys(contracts))