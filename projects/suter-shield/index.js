const sdk = require('@defillama/sdk');
const suter_eth_v1_abi = require('./suter_eth_v1.json');
const suter_erc20_v1_abi = require('./suter_erc20_v1.json');
const suter_eth_v2_abi = require('./suter_eth_v2.json');
const suter_erc20_v2_abi = require('./suter_erc20_v2.json');

// ETH
const ETH_COIN = '0x0000000000000000000000000000000000000000';
const SUTER_ETH_V1 = '0x02b4E089E96a0A672dE0a0d93E2869B899b15a44';
const SUTER_ETH_V2 = '0x934cc5704165711296207b5AFc87933AE0685a4C';

const USDT_COIN = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const SUTER_USDT_V1 = '0x29abf1a011cdfb9548dc8faa6d19b1b39808bf58';
const SUTER_USDT_V2 = '0xB8fcF79EAd34E98e45fc21E5dB1C5C561d906371';

const DAI_COIN = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const SUTER_DAI_V1 = '0x54A8e0C76Eec21DD30842FbbcA2D336669102b77';
const SUTER_DAI_V2 = '0xbdf418486D438e44F5aAC6aF86330dA638ea70AD';

const SUTER_COIN = '0xAA2ce7Ae64066175E0B90497CE7d9c190c315DB4';
const SUTER_SUTER_V1 = '0xab4e72599e2cec5dcc8249657833b3408905900e';

// BSC
const BNB_COIN = 'bsc:0x0000000000000000000000000000000000000000';
const SUTER_BNB_V1 = '0x2A00d7d2de1E147a3BCAa122B4EC5D6f9F0c1147';
const SUTER_BNB_V2 = '0x5bb6eE37a6503fe381207c3BAC0Aa6d7B33590Fa';

const BUSD_COIN = 'bsc:0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
const SUTER_BUSD_V1 = '0xe557c77Ed24df7cDF21ED55a8C56Ea36CeBD5BD2';
const SUTER_BUSD_V2 = '0x382926Ba4D92E5d7652A85Aa7085Ffb15b6b6C89';

const CAKE_COIN = 'bsc:0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';
const SUTER_CAKE_V1 = '0x8cc4c8529c0D8bb9B9FA197530d656cCBcB88DeB';
const SUTER_CAKE_V2 = '0xa19e53Af2381F34AEcA80cDcEBF6c4a3F37037a2';

const BAKE_COIN = 'bsc:0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5';
const SUTER_BAKE_V1 = '0x9D529c70fD8e072786b721190f6E6B30e433690a';
const SUTER_BAKE_V2 = '0x6F3Ad49e287c2dC12aA5f0bD9e8173C57d1AdECa';

const BSC_SUTER_COIN = 'bsc:0x4cfbbdfbd5bf0814472ff35c72717bd095ada055';
const BSC_SUTER_SUTER_V1 = '0x617edfadeC530aE747088672831EaC5B1A6A5220';
const BSC_SUTER_SUTER_V2 = '0x1E02013eF23C1784b3c2E2c08b1e4c253ABa2b85';

const XSUTER_COIN = 'bsc:0x822d04d22f962d6132f53b0fa6b9409097d12550';
const BSC_SUTER_XSUTER_V1 = '0x4de5cB2EB81A37DD768fc58fe0ca7b811C997c35';
const BSC_SUTER_XSUTER_V2 = '0x41690D4E1E20B0cBB1fb6004CA80e67bdFa6BA02';

// POLYGON
const MATIC_COIN = 'polygon:0x0000000000000000000000000000000000000000';
const POLYGON_SUTER_MATIC_V1 = '0x934cc5704165711296207b5AFc87933AE0685a4C';

// SMART BCH
const BCH_COIN = 'smartbch:0x0000000000000000000000000000000000000000';
const SUTER_BCH_V2 = '0x5B5bC8624F595136CdC4593606883c60A2150aF2';

const FLEXUSD_COIN = 'smartbch:0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72';
const SUTER_FLEXUSD_V2 = '0xe253BAA5C5b5615727Cf2C55Aa806090D891Cd54';


async function eth_tvl_v1(timestamp, block) {
  let balances = {};
  let pools = [SUTER_ETH_V1, SUTER_USDT_V1, SUTER_DAI_V1, SUTER_SUTER_V1];
  let eth_tvl;
  for (const pool of pools) {
    if(pool === SUTER_ETH_V1){
      eth_tvl = await sdk.api.eth.getBalance({
        target: pool,
        block,
        chain: 'ethereum'
      })
    }else{
      let tvl = await sdk.api.abi.call({
        target: pool,
        abi: suter_erc20_v1_abi['poolValue'],
        block: block 
      });
    }  
}
  
  return balances;
}


async function tvl(timestamp, block) {
    let balances = {};

    const poolTVL = await sdk.api.abi.call({
      target: SUTER_ETH_V1,
      abi: abi['poolValue'],
      block: block 
    });
    const truTVL = await sdk.api.abi.call({
      target: stkTRU,
      abi: abi['stakeSupply'],
      block: block 
    });
    
    balances[TUSD] = poolTVL.output;
    balances[TRU] = truTVL.output;
    
    return balances;
}

module.exports = {
  ethereum:{
    tvl,
  },
  tvl
}