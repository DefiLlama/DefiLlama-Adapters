const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const axios = require("axios");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs")
const address = require("./addressFTM.json");
const abi = require("./abi.json");

const allValut = Object.keys(address).filter( x=> x.toUpperCase().substring(0,5) == "VAULT").map(x=> address[x]);
const allWorker = Object.keys(address).filter( x=> x.toUpperCase().substring(x.length - 6) == "WORKER").map(x=> address[x]);
function getFTMAddress(address) {
    return `fantom:${address.toUpperCase()}`
  }

async function tvl(timestamp, ethBlock, chainBlocks) {
    const balances = {}
    const block = chainBlocks.fantom;
  
    //#region  WORKER
    var stakingCall = [];
    var promise = [];
    for await (const workerAddress of allWorker)
    {
        let res = (new Promise(async (resolve,reject)=>
            {
                const lp = (await sdk.api.abi.call(
                    {
                        abi: abi.WORKER.lpToken,
                        target: workerAddress,
                        params: [],
                        block: block,
                        chain: "fantom"
                  })).output;
                const masterChef = (await sdk.api.abi.call(
                    {
                        abi: abi.WORKER.masterchef,
                        target: workerAddress,
                        params: [],
                        block: block,
                        chain: "fantom"
                  })).output;
                const pid = (await sdk.api.abi.call(
                  {
                      abi: abi.WORKER.pid,
                      target: workerAddress,
                      params: [],
                      block: block,
                      chain: "fantom"
                })).output;
                resolve({lp,masterChef,pid,workerAddress});
            }));
        promise.push(res);
    }
    stakingCall = await Promise.all(promise);
    // console.log(stakingCall);
    const resUserInfo = (await sdk.api.abi.multiCall({
        block,
        abi: abi.MASRERCHEF.userinfo,
        chain: 'fantom',
        calls: stakingCall.map(x => { return {  target: x.masterChef, params: [x.pid, x.workerAddress] }})
      })).output
    //  console.log(resUserInfo);
     const stakingInfo = await stakingCall.map(x=> { 
        let o = Object.assign({}, x);
        let userInfo = resUserInfo.find(y=>y.input.params[0] == o.pid && y.input.params[1] == o.workerAddress && y.input.target == o.masterChef  );
        if (userInfo != undefined)
        {
            o.amount = userInfo.output.amount;
            o.rewardDebt =  userInfo.output.rewardDebt;
        }
         return  o;
     })
    //  console.log(stakingInfo);
    await unwrapUniswapLPs(balances,
        stakingInfo.map( x => {
            return {token: x.lp, balance: x.amount}
        })
      , block, 'fantom', (addr) => getFTMAddress(addr))
    //#endregion

    //#region  VALUT
    const getBaseToken = async ()=>
    {
        let res = (await sdk.api.abi.multiCall(
        {
            abi: abi.VALUT.baseToken,
            calls : allValut.map((valutAddress) => { return { target: valutAddress }} ),
            block: block,
            chain: "fantom"
        })).output;
        return res.map(x=> { return {valut: x.input.target , token:x.output}});
    }
    const getBalance = async (valutInfo)=>
    {
        let res = (await sdk.api.abi.multiCall(
        {
            abi: "erc20:balanceOf",
            calls : valutInfo.map((info) => { return { target: info.token , params: [info.valut]  }} ),
            block: block,
            chain: "fantom"
        })).output;
        return res.map(x=> { return {token: x.input.target , amount:x.output}});
    }
    let baseToken = await getBaseToken();
    let valutAmount = await getBalance(baseToken);
    // console.log(baseToken);
    // console.log(valutAmount);
    for await (const detail of valutAmount)
    {
        balances[getFTMAddress(detail.token)] =   BigNumber( balances[getFTMAddress(detail.token)] || 0 ).plus(detail.amount);
    }
    //#endregion

    //#region  MEOW Token
    /// MEOW-FTM Liquidity
    let lpTotal = (await sdk.api.abi.call(
        {
            abi: "erc20:totalSupply",
            target: address.MeowLP,
            params: [],
            block: block,
            chain: "fantom"
        })).output;
    let lpBalance = {};
    await unwrapUniswapLPs(lpBalance,
        [{token: address.MeowLP, balance: lpTotal}]
        , block, 'fantom', (addr) => (addr))
    // console.log(lpBalance);
    for await (const obj of Object.keys(lpBalance))
    {
        balances[getFTMAddress(obj)] =   BigNumber( balances[getFTMAddress(obj)] || 0 ).plus(lpBalance[obj]);
    }
    //#endregion

    return balances;

};

module.exports = {
    fantom:{
        tvl,
      }
  };
    