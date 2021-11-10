const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

// ETH
const SUTER_ETH_V1 = '0x02b4E089E96a0A672dE0a0d93E2869B899b15a44';
const SUTER_ETH_V2 = '0x934cc5704165711296207b5AFc87933AE0685a4C';

const SUTER_USDT_V1 = '0x29abf1a011cdfb9548dc8faa6d19b1b39808bf58';
const SUTER_USDT_V2 = '0xB8fcF79EAd34E98e45fc21E5dB1C5C561d906371';

const SUTER_DAI_V1 = '0x54A8e0C76Eec21DD30842FbbcA2D336669102b77';
const SUTER_DAI_V2 = '0xbdf418486D438e44F5aAC6aF86330dA638ea70AD';

const SUTER_SUTER_V1 = '0xab4e72599e2cec5dcc8249657833b3408905900e';

// BSC
const SUTER_BNB_V1 = '0x2A00d7d2de1E147a3BCAa122B4EC5D6f9F0c1147';
const SUTER_BNB_V2 = '0x5bb6eE37a6503fe381207c3BAC0Aa6d7B33590Fa';

const SUTER_BUSD_V1 = '0xe557c77Ed24df7cDF21ED55a8C56Ea36CeBD5BD2';
const SUTER_BUSD_V2 = '0x382926Ba4D92E5d7652A85Aa7085Ffb15b6b6C89';


const SUTER_CAKE_V1 = '0x8cc4c8529c0D8bb9B9FA197530d656cCBcB88DeB';
const SUTER_CAKE_V2 = '0xa19e53Af2381F34AEcA80cDcEBF6c4a3F37037a2';


const SUTER_BAKE_V1 = '0x9D529c70fD8e072786b721190f6E6B30e433690a';
const SUTER_BAKE_V2 = '0x6F3Ad49e287c2dC12aA5f0bD9e8173C57d1AdECa';


async function tvl(timestamp, block) {
    let balances = {};

    const poolTVL = await sdk.api.abi.call({
      target: POOL,
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