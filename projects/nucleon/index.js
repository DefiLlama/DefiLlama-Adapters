const { stakingPricedLP } = require("../helper/staking");
const sdk = require("@defillama/sdk")
const { pool2 } = require("../helper/pool2");
const {sumLPWithOnlyOneToken} = require("../helper/unwrapLPs.js");

const axios = require("axios");
const { BigNumber } = require("ethers");

const MasterchefV2 = "0xeced26633b5c2d7124b5eae794c9c32a8b8e7df2";
const NUT_TokenAddress = "0xfe197e7968807b311d476915db585831b43a7e3b";
const XCFX_TokenAddress = "0x889138644274a7dc602f25a7e7d53ff40e6d0091";

const CFX_NUT_LP_TokenAddress = "0xd9d5748cb36a81fe58f91844f4a0412502fd3105";
const CFX_XCFX_LP_TokenAddress = "0x949b78ef2c8d6979098e195b08f27ff99cb20448";

const WCFX = "0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b";

const chain = 'conflux';

function stakedValue(target) {
  return async (timestamp, block, chainBlocks) => {
      let supply = {};
      supply = { usd: (await sdk.api.abi.call({
        target,
          abi: 'erc20:totalSupply',
          block: chainBlocks[chain],
          chain
      })).output / 10 ** 18 };
      let price = (await getCFXPrice());
      
      let cfx_nut_balance = {};
      await sumLPWithOnlyOneToken(cfx_nut_balance, CFX_NUT_LP_TokenAddress,MasterchefV2, WCFX, undefined, chain, () => "wrapped-conflux");
      cfx_nut_balance['wrapped-conflux'] = Number(cfx_nut_balance['wrapped-conflux'])*price/(10 ** 18);
      
      let cfx_xcfx_balance = {};
      await sumLPWithOnlyOneToken(cfx_xcfx_balance, CFX_XCFX_LP_TokenAddress,MasterchefV2, WCFX, undefined, chain, () => "wrapped-conflux");
      cfx_xcfx_balance['wrapped-conflux'] = Number(cfx_xcfx_balance['wrapped-conflux'])*price/(10 ** 18);

      supply.usd = supply.usd * price 
      supply.usd += cfx_xcfx_balance["wrapped-conflux"];
      supply.usd += cfx_nut_balance["wrapped-conflux"];
      

      return supply;
  };
}


async function getCFXPrice() {
  const tokenId = "wrapped-conflux";
  // https://api.coingecko.com/api/v3/simple/price?ids=wrapped-conflux&vs_currencies=usd
  let result;
  let price = 0;
  try {
      result =
          await axios({
              method: "GET",
              url: "https://api.coingecko.com/api/v3/simple/price",
              params: {
                  ids: tokenId,
                  vs_currencies: "usd",
              },
          });
  } catch (e) {
      return price;
  }
  const data = result.data;
  price = data[tokenId].usd;
  return price;
}



function nut_cfx_pool(chain = "ethereum", transformAddress = (addr) => addr) {
  return async (_timestamp, _ethBlock, chainBlocks) => {
      let balances = {};
      await sumLPWithOnlyOneToken(balances, CFX_NUT_LP_TokenAddress,MasterchefV2, WCFX, undefined, chain, transformAddress);
      balances['wrapped-conflux'] = Number(balances['wrapped-conflux'])/(10 ** 18);
      return balances;
  }
}


function xcfx_cfx_pool(chain = "ethereum", transformAddress = (addr) => addr) {
  return async (_timestamp, _ethBlock, chainBlocks) => {
      let balances = {};
      await sumLPWithOnlyOneToken(balances, CFX_XCFX_LP_TokenAddress,MasterchefV2, WCFX, undefined, chain, transformAddress);
      balances['wrapped-conflux'] = Number(balances['wrapped-conflux'])/(10 ** 18);
      return balances;
  }
}

module.exports = {
  methodology: 'TVL accounts for total amount of CFX Staked on the protocol + the value of All LP Tokens staked on the Masterchef or Pools.',
  conflux: {
    tvl: stakedValue(XCFX_TokenAddress, "conflux",() => "wrapped-conflux"),
    staking: xcfx_cfx_pool("conflux", () => "wrapped-conflux"),
    pool2: nut_cfx_pool("conflux", () => "wrapped-conflux"),
  },
}
