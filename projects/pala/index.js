const ABI = require("./abi.json");
const Caver = require("caver-js");
const { toUSDTBalances } = require("../helper/balances");

const PALA_EP_URL = "https://public-node-api.klaytnapi.com/v1/cypress";
const VIEWER_ADDR = "0x2B16648ddD1559fc86e0c0617213Ab5dd2Ea01B9";
const PALA_FARM_ADDR = "0xCFC140E8e3b1B05f9ACb4a42249b7aBB8c27576C";

const getPoolsInfo = async (caver) => {
    const sc = caver.contract.create([ABI.poolInfos], VIEWER_ADDR);
    return await sc.methods.poolInfos().call();
}

const getTokenInfoDetail = async (caver, tokenAddr) => {
    const sc = caver.contract.create([ABI.tokenInfoDetail], VIEWER_ADDR);
    return await sc.methods.tokenInfoDetail(tokenAddr).call();
}

const getFarmInfos = async (caver, farmAddr) => {
    const sc = caver.contract.create([ABI.farmInfos], VIEWER_ADDR);
    return await sc.methods.farmInfos(farmAddr).call();
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

    const tvl = volumes.reduce((acc, cur) => acc + cur).toFixed(2);
    return toUSDTBalances(tvl);
}

const calcStakedLPToken = async (caver, poolInfo) => {
    const sc = caver.contract.create([ABI.balanceOf, ABI.totalSupply], poolInfo.pool);
    const totalLPSupply = await sc.methods.totalSupply().call();
    const liquidityVolume = await calcPoolLiquidityVolume(caver, poolInfo)
    if (isNaN(+totalLPSupply) || +totalLPSupply === 0)  return 0

    const stakedLP = await sc.methods. balanceOf(PALA_FARM_ADDR).call();
    const stakedLPRatio = stakedLP / totalLPSupply;
    const stakedToken = stakedLPRatio * liquidityVolume;
    return stakedToken;
}

const fetchStakedToken = async () => {
    const caver = new Caver(PALA_EP_URL);

    const poolInfos = await getPoolsInfo(caver);
    const totalLPStakeds = await Promise.all(
        poolInfos.map((poolInfo) => { return calcStakedLPToken(caver, poolInfo)})        
    );
    const totalLpStaked = totalLPStakeds.reduce((acc, cur) => acc + cur );
    
    const farmInfos = await getFarmInfos(caver, PALA_FARM_ADDR);
    const palaFarmInfo = farmInfos.farmInfoList[0];
    const palaInfoDetail = await getTokenInfoDetail(caver, palaFarmInfo.pool);
    const palaStaked = (palaFarmInfo.totalLP / 1e18) * (palaInfoDetail.price / 1e18);

    const totalStaked = (palaStaked + totalLpStaked);
    return toUSDTBalances(totalStaked.toFixed(2));
}

module.exports = {
    timetravel: false,
    klaytn:{
        staking:fetchStakedToken,
        tvl:fetchLiquidity
    },
    methodology:
        "Sum of the total volume of the LPs. Staked is calculated by sum of the total staked PALA tokens"
}