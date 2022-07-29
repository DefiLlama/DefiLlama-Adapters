import path from "path";
import axios from "axios";
import { ethers } from "ethers";
import { providers } from "./utils/ethers"
import {
    humanizeNumber,
  } from "@defillama/sdk/build/computeTVL/humanizeNumber";

const TOTAL_BINS = 20;

interface Liq {
    owner: string,
    liqPrice: number,
    collateral: string,
    collateralAmount: string,
}

interface Bins {
    [token:string]:{
        bins:{
            [bin:number]:number
        },
        binSize: number,
        price: number,
    }
}

const f2 = (n:number) => Number(n.toFixed(2))

async function binResults(liqs:Liq[]){
    const tokens = new Set<string>()
    liqs.map(liq=>tokens.add(liq.collateral))
    const prices = (await axios.post("https://coins.llama.fi/prices", {
        "coins": Array.from(tokens)
    })).data.coins as {
        [address:string]: { decimals: number, price: number, symbol: string, timestamp: number }
    }
    const bins = Object.values(prices).reduce((all, token)=>({
        ...all,
        [token!.symbol]:{
            bins: {},
            binSize: token.price/TOTAL_BINS,
            price: token.price,
        }
    }), {} as Bins)
    const skippedTokens = new Set<string>()
    liqs.map(liq=>{
        const tokenAddress = liq.collateral.toLowerCase()
        const token = prices[tokenAddress]
        if(token === undefined){
            skippedTokens.add(tokenAddress)
            return
        }
        const binSize = bins[token.symbol].binSize;
        const bin = Math.floor(liq.liqPrice/binSize)
        if(bins[token.symbol].bins[bin] === undefined){
            bins[token.symbol].bins[bin] = 0
        }
        bins[token.symbol].bins[bin] += Number(liq.collateralAmount)/(10**token.decimals)
    })
    let sumLiquidable = 0
    const liquidableTable = [] as any[]
    Object.entries(bins).map(([symbol, tokenLiqs])=>{
        console.log(`${symbol} (current price: ${tokenLiqs.price})`)
        const max = Object.values(tokenLiqs.bins).reduce((max, bin)=>Math.max(max, bin), 0);
        for(let i=0; i<TOTAL_BINS; i++){
            const amountInBin = tokenLiqs.bins[i] ?? 0;
            const range = (n:number) => (tokenLiqs.binSize*n).toFixed(2)
            console.log(`${"#".repeat((amountInBin/max)*10).padEnd(10)} = ${range(i)}-${range(i+1)} = ${amountInBin.toFixed(2)}`)
        }
        let sumInside = 0;
        let sumOutside = 0;
        Object.entries(tokenLiqs.bins).map(([i, amount])=>{
            if(Number(i)<TOTAL_BINS){
                sumInside += amount;
            } else {
                sumOutside += amount;
            }
        })
        if(sumOutside > 0){
            const percentLiquidable = 100*sumOutside/(sumInside+sumOutside)
            const liquidable = tokenLiqs.price*sumOutside
            sumLiquidable += liquidable
            liquidableTable.push({
                symbol,
                percentLiquidable: f2(percentLiquidable),
                totalLiquidableTokens: f2(sumOutside),
                totalLiquidableUSD: liquidable
            })
        }
        console.log("")
    })
    const skippedTable = await Promise.all(Array.from(skippedTokens).map(async tokenAddress=>{
        const [chain, address] = tokenAddress.split(":")
        const tokenContract = new ethers.Contract(address, [
            "function symbol() view returns (string)"
        ], providers[chain])
        let symbol:string;
        try{
            symbol = await tokenContract.symbol();
        }catch(e){
            symbol = "UNKNOWN"
        }
        return {
            symbol,
            address: tokenAddress
        }
    }))
    if(skippedTable.length > 0){
        console.log(`The following tokens couldn't be priced and have been skipped:`)
        console.table(skippedTable)
    }
    if(sumLiquidable > 0){
        console.log("\nLiquidable positions:")
        console.table(liquidableTable
            .sort((a,b)=>b.totalLiquidableUSD - a.totalLiquidableUSD)
            .concat([{
                symbol: "Total",
                percentLiquidable: "-",
                totalLiquidableTokens: "-",
                totalLiquidableUSD: sumLiquidable
            }])
            .map(o=>({
            ...o,
            totalLiquidableUSD: humanizeNumber(o.totalLiquidableUSD)
        })))
        console.log("If this number is high double check your data!")
    }
    console.log(liqs)
}

async function main(){
    const passedFile = path.resolve(process.cwd(), process.argv[2]);
    let module = {} as any;
    try {
        module = require(passedFile)
      } catch(e) {
        console.log(e)
      }
    const liqs = await module.ethereum.liquidations();
    await binResults(liqs)
    //console.log(liqs)
    console.log(`\nSize of all liquidation data: ${JSON.stringify(liqs).length/10**6} MB`)
    process.exit(0)
}
main()