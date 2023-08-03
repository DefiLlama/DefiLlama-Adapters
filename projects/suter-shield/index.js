const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js")

// ETH
const ETH_COIN = ADDRESSES.null;
const SUTER_ETH_V1 = '0x02b4E089E96a0A672dE0a0d93E2869B899b15a44';
const SUTER_ETH_V2 = '0x934cc5704165711296207b5AFc87933AE0685a4C';

const USDT_COIN = ADDRESSES.ethereum.USDT;
const SUTER_USDT_V1 = '0x29abf1a011cdfb9548dc8faa6d19b1b39808bf58';
const SUTER_USDT_V2 = '0xB8fcF79EAd34E98e45fc21E5dB1C5C561d906371';

const DAI_COIN = ADDRESSES.ethereum.DAI;
const SUTER_DAI_V1 = '0x54A8e0C76Eec21DD30842FbbcA2D336669102b77';
const SUTER_DAI_V2 = '0xbdf418486D438e44F5aAC6aF86330dA638ea70AD';

const SUTER_COIN = '0xAA2ce7Ae64066175E0B90497CE7d9c190c315DB4';
const SUTER_SUTER_V1 = '0xab4e72599e2cec5dcc8249657833b3408905900e';

// BSC
// const BNB_COIN = ADDRESSES.null;
// WBNB
const BNB_COIN = ADDRESSES.bsc.WBNB;
const SUTER_BNB_V1 = '0x2A00d7d2de1E147a3BCAa122B4EC5D6f9F0c1147';
const SUTER_BNB_V2 = '0x5bb6eE37a6503fe381207c3BAC0Aa6d7B33590Fa';

const BUSD_COIN = ADDRESSES.bsc.BUSD;
const SUTER_BUSD_V1 = '0xe557c77Ed24df7cDF21ED55a8C56Ea36CeBD5BD2';
const SUTER_BUSD_V2 = '0x382926Ba4D92E5d7652A85Aa7085Ffb15b6b6C89';

const CAKE_COIN = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';
const SUTER_CAKE_V1 = '0x8cc4c8529c0D8bb9B9FA197530d656cCBcB88DeB';
const SUTER_CAKE_V2 = '0xa19e53Af2381F34AEcA80cDcEBF6c4a3F37037a2';

const BAKE_COIN = '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5';
const SUTER_BAKE_V1 = '0x9D529c70fD8e072786b721190f6E6B30e433690a';
const SUTER_BAKE_V2 = '0x6F3Ad49e287c2dC12aA5f0bD9e8173C57d1AdECa';

const BSC_SUTER_COIN = '0x4cfbbdfbd5bf0814472ff35c72717bd095ada055';
const BSC_SUTER_SUTER_V1 = '0x617edfadeC530aE747088672831EaC5B1A6A5220';
const BSC_SUTER_SUTER_V2 = '0x1E02013eF23C1784b3c2E2c08b1e4c253ABa2b85';

const XSUTER_COIN = '0x822d04d22f962d6132f53b0fa6b9409097d12550';
const BSC_SUTER_XSUTER_V1 = '0x4de5cB2EB81A37DD768fc58fe0ca7b811C997c35';
const BSC_SUTER_XSUTER_V2 = '0x41690D4E1E20B0cBB1fb6004CA80e67bdFa6BA02';

async function eth_tvl(timestamp, block) {
  let balances = {};
  let total_eth_tvl = 0;
  let pools = {[ETH_COIN]: [SUTER_ETH_V1, SUTER_ETH_V2], [USDT_COIN]: [SUTER_USDT_V1, SUTER_USDT_V2], [DAI_COIN]: [SUTER_DAI_V1, SUTER_DAI_V2], [SUTER_COIN]: [SUTER_SUTER_V1]};
  for(var coin in pools){
    for(var pool of pools[coin]) {
      if(coin !== ETH_COIN){
        let erc20_tvl = await sdk.api.erc20.balanceOf({
          target: coin,
          owner: pool,
          block: block,
          chain: 'ethereum'
        });
        if(balances[coin] === undefined){
          balances[coin] = erc20_tvl.output;
        }else{
          balances[coin] = new BigNumber(balances[coin]).plus(new BigNumber(erc20_tvl.output));
        }
      }
      let eth_tvl = await sdk.api.eth.getBalance({
        target: pool,
        block,
        chain: 'ethereum'
      });
      total_eth_tvl = new BigNumber(eth_tvl.output).plus(new BigNumber(total_eth_tvl));
    }
  }

  balances[ETH_COIN] = total_eth_tvl.toString();
  return balances;
}

async function bsc_tvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.bsc;
  let balances = {};
  let total_bnb_tvl = 0;
  let pools = {[BNB_COIN]: [SUTER_BNB_V1, SUTER_BNB_V2], [BUSD_COIN]: [SUTER_BUSD_V1, SUTER_BUSD_V2], [CAKE_COIN]: [SUTER_CAKE_V1, SUTER_CAKE_V2], [BAKE_COIN]: [SUTER_BAKE_V1, SUTER_BAKE_V2], [BSC_SUTER_COIN]: [BSC_SUTER_SUTER_V1, BSC_SUTER_SUTER_V2], [XSUTER_COIN]: [BSC_SUTER_XSUTER_V1, BSC_SUTER_XSUTER_V2]};
  for(var coin in pools){
    for(var pool of pools[coin]) {
      if(coin !== BNB_COIN){
        let erc20_tvl = await sdk.api.erc20.balanceOf({
          target: coin,
          owner: pool,
          block: block,
          chain: 'bsc'
        });
        if(balances[`bsc:${coin}`] === undefined){
          balances[`bsc:${coin}`] = erc20_tvl.output;
        }else{
          balances[`bsc:${coin}`] = new BigNumber(balances[`bsc:${coin}`]).plus(new BigNumber(erc20_tvl.output));
        }
      }
      let bnb_tvl = await sdk.api.eth.getBalance({
         target: pool,
         //block,
         chain: 'bsc'
      });
      total_bnb_tvl = new BigNumber(bnb_tvl.output).plus(new BigNumber(total_bnb_tvl));
    }
  }

  balances[`bsc:${BNB_COIN}`] = total_bnb_tvl.toString();
  return balances;
}


module.exports = {
  timetravel: false,
  ethereum:{
    tvl: eth_tvl,
  },
  bsc: {
    tvl: bsc_tvl,
  },
};