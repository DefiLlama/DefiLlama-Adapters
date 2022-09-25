const sdk = require("@defillama/sdk");
const { transformPolygonAddress } = require('../helper/portedTokens');
const { masterChefExports } = require("../helper/masterchef");
const { stakingPricedLP } = require("../helper/staking");
const { unwrapCrv, resolveCrvTokens } = require("../helper/resolveCrvTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { ethers } = require("ethers")

const masterChefABI = require("./masterChefABI.json");
const vaultABI = require("./vaultABI.json");

const MASTERCHEF = "0xef79881df640b42bda6a84ac9435611ec6bb51a4";
const POLYCUB_TOKEN = "0x7cc15fef543f205bf21018f038f591c6bada941c";

let curvePools = {
  "0xdAD97F7713Ae9437fa9249920eC8507e5FbB23d3": { //ETH-BTC-USD
    minter: "0x92215849c439e1f8612b6646060b4e3e5ef822cc", //holds all tokens
    underlying: [
      "0x28424507fefb6f7f8e9d3860f56504e4e5f5f390", //amWETH
      "0x5c2ed810328349100a66b82b78a1791b101c9d61", //amWBTC
      "0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171"  //am3CRV
    ]
  },
  "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171": { //am3CRV
    minter: "0x445FE580eF8d70FF569aB36e80c647af338db351",
    underlying: [
      "0x1a13f4ca1d028320a707d99520abfefca3998b7f", //USDC
      "0x60d55f02a771d515e077c9c2403a1ef324885cec", //USDT
      "0x27f8d03b3a2196956ed754badc28d73be8830a6e" //DAI
    ]
  }
}

let aaveTokenUnderying = {
  "0x28424507fefb6f7f8e9d3860f56504e4e5f5f390": "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", //amWETH
  "0x5c2ed810328349100a66b82b78a1791b101c9d61": "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6", //amWBTC
  "0x1a13F4Ca1d028320A707D99520AbFefca3998b7F": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", //USDC
  "0x60D55F02A771d515e077c9C2403a1ef324885CeC": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", //USDT
  "0x27F8D03b3a2196956ED754baDc28D73be8830A6e": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063" //DAI
}

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}

  const poolsLength = (await sdk.api.abi.call({
    abi: masterChefABI.poolLength,
    chain: 'polygon',
    target: MASTERCHEF,
    params: [],
    block: chainBlocks['polygon'],
  })).output;

  for (let i = 0; i < poolsLength; i++){
    let poolInfo = (await sdk.api.abi.call({
        abi: masterChefABI.poolInfo,
        target: MASTERCHEF,
        params: i,
        chain: "polygon",
        block: chainBlocks["polygon"],
      })
    ).output;

    if (poolInfo.allocPoint == 0) continue;
    if (poolInfo.strat == "0x6E2780bc4C9027c98F20f8c1df80439EE1536939") continue; //xPolycub vault token

    let wantBalance = (await sdk.api.abi.call({
      abi: vaultABI[62], //wantLockedTotal
      chain: 'polygon',
      target: poolInfo.strat,
      params: [],
      block: chainBlocks['polygon'],
    })).output
    // let decimals = (await sdk.api.erc20.decimals(poolInfo.want, 'polygon')).output

    if (poolInfo.want == "0xdAD97F7713Ae9437fa9249920eC8507e5FbB23d3" || poolInfo.want == "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171"){ //Curve vaults
      balances[poolInfo.want] = wantBalance
      let res = await resolveCrvTokens(balances, chainBlocks['polygon'], "polygon") //will return amounts of underlying tokens

      for (const address in res) {
        let underlying = aaveTokenUnderying[address] //find underlying token to aave token
        if (underlying){
          balances["polygon:"+underlying] = res[address] //1 token = 1 amToken
          delete balances[address] //delete to avoid possible double-counting
        }
      }

    } else {
      let lp = [{
        token: poolInfo.want,
        balance: wantBalance
      }]
      let res = await unwrapUniswapLPs(balances, lp, chainBlocks['polygon'], "polygon", (addr) => `polygon:${addr}`)
    }
  }

  //replace pSPS and pLEO contracts with SPS and LEO
  //so they are found on coingecko.
  let unknown = ["polygon:0xf826a91e8de52bc1baf40d88203e572dc2551aa3", "polygon:0x28cead9e4ff96806c79f4189ef28fc61418e2216"]
  let replacement = ["bsc:0x6421531af54c7b14ea805719035ebf1e3661c44a", "bsc:0x1633b7157e7638c4d6593436111bf125ee74703f"]
  for (let i in unknown){
    balances[replacement[i]] = balances[unknown[i]]
    //pSPS has 8 decimals while SPS has 18
    if (replacement[i] == "bsc:0x1633b7157e7638c4d6593436111bf125ee74703f"){
      balances[replacement[i]] = ethers.BigNumber.from(balances[replacement[i]]).mul(Math.pow(10, 10).toString()).toString()
    }
    delete balances[unknown[i]]
  }

  //Add pool2
  let balancePool2 = await sdk.api.erc20.balanceOf({
    target: POLYCUB_TOKEN,
    owner: "0x905E21f6C4CB1Ad789CeD61CD0734590a4542346",
    chain: 'polygon',
    block: chainBlocks["polygon"]
  })

  balances["polygon:0x7cc15fef543f205bf21018f038f591c6bada941c"] = ethers.BigNumber.from(balances["polygon:0x7cc15fef543f205bf21018f038f591c6bada941c"])
    .add(ethers.BigNumber.from(balancePool2.output)).toString()

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'Counts total TVL in all farms, including pool2',
  start: 25585149,
  polygon: {
    tvl,
  }
};
