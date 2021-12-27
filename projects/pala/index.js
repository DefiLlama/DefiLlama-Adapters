const ABI = require("./abi.json");
const Caver = require("caver-js");
const { toUSDTBalances } = require("../helper/balances");

const PALA_EP_URL = "https://gateway.pala.world";

const VIEWER_ADDR = "0xEE50E2679E763a0a605e9c09e42a71340e4b67A3";
const ATTEN_FARM_ADDR = "0x883726a307D420286086679F7851d8378bb16771"
const PALA_FARM_ADDR = "0xCFC140E8e3b1B05f9ACb4a42249b7aBB8c27576C"

const getPoolsInfo = async (caver) => {
    const sc = caver.contract.create([ABI.poolInfos], VIEWER_ADDR);
    return await sc.methods.poolInfos().call();
}

const getTokenInfoDetail = async (caver, tokenAddr) => {
    const sc = caver.contract.create([ABI.tokenInfoDetail], VIEWER_ADDR);
    return await sc.methods.tokenInfoDetail(tokenAddr).call();
}

const calcPoolLiquidityVolume = async (caver, poolInfo) => {
    const t0Detail = await getTokenInfoDetail(caver, poolInfo.token0);
    const t0Info = t0Detail.info;
    const t0Price = t0Detail.price;
    const t1Detail = await getTokenInfoDetail(caver, poolInfo.token1);
    const t1Info = t1Detail.info;
    const t1Price = t1Detail.price;

    return ((t0Price / 1e18) * (poolInfo.token0Reserve / Math.pow(10, t0Info.decimals))) +
    ((t1Price / 1e18) * (poolInfo.token1Reserve / Math.pow(10, t1Info.decimals)));
}

const fetchLiquidity = async () => {
    const caver = new Caver(PALA_EP_URL);
    const poolInfos = await getPoolsInfo(caver);
    const volumes = await Promise.all(
        poolInfos.map((poolInfo) => { return calcPoolLiquidityVolume(caver, poolInfo)})
    );

    const tvl = volumes.reduce((acc, cur) => acc + cur);
    return toUSDTBalances(tvl.toFixed(2));
}

const calcStakedToken = async (caver, poolInfo) => {
    const sc = caver.contract.create([ABI.balanceOf, ABI.totalSupply], poolInfo.pool);

    const totalLPSupply = await sc.methods.totalSupply().call();
    const liquidityVolume = await calcPoolLiquidityVolume(caver, poolInfo)

    const stakedAttenLP = await sc.methods.balanceOf(ATTEN_FARM_ADDR).call();
    const stakedAttenRatio = stakedAttenLP / totalLPSupply;
    const stakedAttenToken = stakedAttenRatio * liquidityVolume;

    const stakedPalaLP = await sc.methods. balanceOf(PALA_FARM_ADDR).call();
    const stakedPalaRatio = stakedPalaLP / totalLPSupply;
    const stakedPalaToken = stakedPalaRatio * liquidityVolume;
    const totalStaked = (stakedAttenToken + stakedPalaToken);
    return totalStaked;
}

const fetchStakedToken = async () => {

    const caver = new Caver(PALA_EP_URL);
    const poolInfos = await getPoolsInfo(caver);

    const totalStakeds = await Promise.all(
        poolInfos.map((poolInfo) => { return calcStakedToken(caver, poolInfo)})        
    );

    return toUSDTBalances(totalStakeds.reduce((acc, cur) => acc + cur ).toFixed(2));
}

module.exports = {
    timetravel: false,
    klaytn:{
        staking:fetchStakedToken,
        tvl:fetchLiquidity
    },
    methodology:
        "Sum of the total volume of the LPs. Staked is calculated by sum of the total staked ATTENTION and PALA tokens"
}