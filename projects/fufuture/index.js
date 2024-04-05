const abi =require("./abi/liquidity_manager")
const tokens =require("./abi/token")
const BigNumber = require("bignumber.js");
const sdk = require('@defillama/sdk');

let transType = ["BTC", "ETH"];

const liquidityManagerAddr="0x0CB5274a8Ff86b7b750933B09aba8B5eb3660977";

async function bsc(api) {
    return getTvl(api,"bsc")
}

async function getTvl(api,chain){
    let lockedMap={};
    let addressMap={};
    for (let i in transType) {
        let type = transType[i];

        let privateRes=await api.multiCall({
            abi: abi.queryPrivatePoolAddress, withMetadata: true, calls: tokens[chain].map(token => ({
                target: liquidityManagerAddr,
                params: [token.address,type]
            }))
        });


        let privateAddresses=[];

        privateRes.map(item=>{
            if(item.output==="0x0000000000000000000000000000000000000000"){
                return;
            }
            privateAddresses.push(item.output)
            addressMap[item.output]=item.input.params[0];
        });


        let targets=privateAddresses.map(item=>({
            target:item
        }));

        let privateLockedInfos=await api.multiCall({
            abi:abi.queryPrivatePoolLockedLiquidity,withMetadata:true,calls:targets
        })


        privateLockedInfos.map(item=>{
            let address=addressMap[item.input.target];
            if(!lockedMap[address]){
                lockedMap[address]=BigNumber("0");
            }

            lockedMap[address]=lockedMap[address].plus(BigNumber(item.output));
        })

    }

    let publicRes=await api.multiCall({
        abi: abi.queryPublicPollAddress, withMetadata: true, calls: tokens[chain].map(token => ({
            target: liquidityManagerAddr,
            params: [token.address]
        }))
    });

    let publicAddress=[];
    publicRes.map(item=>{
        if(item.output==="0x0000000000000000000000000000000000000000"){
            return;
        }
        publicAddress.push(item.output)
        addressMap[item.output]=item.input.params[0];
    });

    let publicLockedInfos=await api.multiCall({
        abi:abi.queryPublicPoolLockedLiquidity,withMetadata:true,calls:publicAddress.map(item=>({
            target:item
        }))
    })

    publicLockedInfos.map(item=>{
        let address=addressMap[item.input.target];
        if(!lockedMap[address]){
            lockedMap[address]=BigNumber("0");
        }
        lockedMap[address]=lockedMap[address].plus(BigNumber(item.output.lockedAmount));
    });

    let balance={};
    for(let i in lockedMap){
        lockedMap[i]=lockedMap[i].toString(10);
        balance[chain+":"+i]=lockedMap[i];
    }

    return balance;
}

module.exports = {
    methodology: "The world's first decentralized currency standard Perpetual options Transaction agreement",
    bsc: {tvl: bsc},
};
