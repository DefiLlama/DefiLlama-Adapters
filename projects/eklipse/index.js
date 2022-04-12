const addresses = require("./address");
const abis = require("./abi");

const TOKEN_ADDRSS = addresses.TOKEN_ADDRSS;
const SWAP_ADDRESS = addresses.SWAP_ADDRESS;
const LP_ADDRESS = addresses.LP_ADDRESS;
const GAUGE_ADDRESS = addresses.GAUGE_ADDRESS;
const EKLIPSE_ADDRESS = addresses.EKLIPSE_ADDRESS;
const LOCK_ADDRESS = addresses.LOCK_ADDRESS;
const KLAYSWAP_ADDRESS = addresses.KLAYSWAP_ADDRESS;
const FARM_ADDRESS = addresses.FARM_ADDRESS;
const EKL_KLAY_ADDRESS = addresses.EKL_KLAY_ADDRESS;
const EKL_USDT_ADDRESS = addresses.EKL_USDT_ADDRESS;

const ERC_20 = abis.ERC_20
const TMOON_LP = abis.TMOON_LP
const SWAP = abis.SWAP;
const EKL = abis.EKL;
const KLAYSWAP = abis.KLAYSWAP;

const Caver = require("caver-js");
const caver = new Caver(
    new Caver.providers.HttpProvider("http://15.165.39.96:8551")
);

function getContract(abi, address){
    const contract = new caver.klay.Contract(abi, address);
    return contract;
}

async function getBalance(contract, address){
    const amount = await contract.methods.balanceOf(address).call();
    return amount;
}

async function getPrice(swap){
    const price = await swap.methods.getVirtualPrice().call();
    return price;
}

async function main(){
    const kdai = getContract(ERC_20, TOKEN_ADDRSS.KDAI);
    const kusdt = getContract(ERC_20, TOKEN_ADDRSS.KUSDT);
    const kusdc = getContract(ERC_20, TOKEN_ADDRSS.KUSDC);

    const TMoonSwapTVL = (await getBalance(kdai, SWAP_ADDRESS.TMOON))/1e18 + (await getBalance(kusdt, SWAP_ADDRESS.TMOON))/1e6 + (await getBalance(kusdc, SWAP_ADDRESS.TMOON))/1e6;

    const pusd = getContract(ERC_20, TOKEN_ADDRSS.PUSD);
    const busd = getContract(ERC_20, TOKEN_ADDRSS.KBUSD);
    const ksd = getContract(ERC_20, TOKEN_ADDRSS.KSD);
    const kash = getContract(ERC_20, TOKEN_ADDRSS.KASH);
    const TMoonLP = getContract(TMOON_LP, LP_ADDRESS.TMOON);

    const TMoonSwap = getContract(SWAP, SWAP_ADDRESS.TMOON);

    let pusdSwapTVL = (await getBalance(pusd, SWAP_ADDRESS.TMOON_PUSD))/1e18;
    let busdSwapTVL = (await getBalance(busd, SWAP_ADDRESS.TMOON_BUSD))/1e18
    let ksdSwapTVL = (await getBalance(ksd, SWAP_ADDRESS.TMOON_KSD))/1e18
    let kashSwapTVL = (await getBalance(kash, SWAP_ADDRESS.TMOON_KASH))/1e18;
    
    const TMoonLpPrice = (await getPrice(TMoonSwap)) / 1e18

    pusdSwapTVL += (await getBalance(TMoonLP, SWAP_ADDRESS.TMOON_PUSD))/1e18 * TMoonLpPrice;
    busdSwapTVL += (await getBalance(TMoonLP, SWAP_ADDRESS.TMOON_BUSD))/1e18 * TMoonLpPrice;
    ksdSwapTVL += (await getBalance(TMoonLP, SWAP_ADDRESS.TMOON_KSD))/1e18 * TMoonLpPrice;
    kashSwapTVL += (await getBalance(TMoonLP, SWAP_ADDRESS.TMOON_KASH))/1e18 * TMoonLpPrice;
    
    FMoonSwapTVL = pusdSwapTVL + busdSwapTVL + ksdSwapTVL + kashSwapTVL;

    const ekl = getContract(EKL, EKLIPSE_ADDRESS);
    const eklLocked = await getBalance(ekl, LOCK_ADDRESS)/1e18;
    const klayswap = getContract(KLAYSWAP, KLAYSWAP_ADDRESS);
    const eklPrice = (await klayswap.methods.estimatePos(EKLIPSE_ADDRESS, "1000000000000000000").call())/1e6;
    const eklTVL = eklLocked * eklPrice

    const TMoonPusdLp = getContract(TMOON_LP, LP_ADDRESS.TMOON_PUSD);
    const TMoonBusdLp = getContract(TMOON_LP, LP_ADDRESS.TMOON_BUSD);
    const TMoonKsdLp = getContract(TMOON_LP, LP_ADDRESS.TMOON_KSD);
    const TMoonKashLp = getContract(TMOON_LP, LP_ADDRESS.TMOON_KASH);

    const TMoonPusdSwap = getContract(SWAP, SWAP_ADDRESS.TMOON_PUSD);
    const TMoonBusdSwap = getContract(SWAP, SWAP_ADDRESS.TMOON_BUSD);
    const TMoonKsdSwap = getContract(SWAP, SWAP_ADDRESS.TMOON_KSD);
    const TMoonKashSwap = getContract(SWAP, SWAP_ADDRESS.TMOON_KASH);

    const TMoonGaugeTVL = (await getBalance(TMoonLP, GAUGE_ADDRESS.TMOON))/1e18 * (await getPrice(TMoonSwap))/1e18;
    const PusdGaugeTVL = (await getBalance(TMoonPusdLp, GAUGE_ADDRESS.TMOON_PUSD))/1e18 * (await getPrice(TMoonPusdSwap))/1e18;
    const BusdGaugeTVL = (await getBalance(TMoonBusdLp, GAUGE_ADDRESS.TMOON_BUSD))/1e18 * (await getPrice(TMoonBusdSwap))/1e18;
    const KsdGaugeTVL = (await getBalance(TMoonKsdLp, GAUGE_ADDRESS.TMOON_KSD))/1e18 * (await getPrice(TMoonKsdSwap))/1e18;
    const KashGaugeTVL = (await getBalance(TMoonKashLp, GAUGE_ADDRESS.TMOON_KASH))/1e18 * (await getPrice(TMoonKashSwap))/1e18;
    const gaugeTVL = TMoonGaugeTVL + PusdGaugeTVL + BusdGaugeTVL + KsdGaugeTVL + KashGaugeTVL;

    const eklKlay = getContract(KLAYSWAP, EKL_KLAY_ADDRESS);
    const eklKlayLpBalance = await eklKlay.methods.balanceOf(FARM_ADDRESS).call();
    const eklKlayBalance = await eklKlay.methods.getCurrentPool().call();
    const eklKlayLpTotalSupply = await eklKlay.methods.totalSupply().call();
    const eklKlayLpPrice = eklKlayBalance[1] * 2 * eklPrice / eklKlayLpTotalSupply
    const eklKlayTVL = eklKlayLpBalance / 1e18 * eklKlayLpPrice;

    const eklUsdt = getContract(KLAYSWAP, EKL_USDT_ADDRESS);
    const eklUsdtLpBalance = await eklUsdt.methods.balanceOf(FARM_ADDRESS).call();
    const eklUsdtBalance = await eklUsdt.methods.getCurrentPool().call();
    const eklUsdtLpTotalSupply = await eklUsdt.methods.totalSupply().call();
    const eklUsdtLpPrice = eklUsdtBalance[1] * 2 / eklUsdtLpTotalSupply
    const eklUsdtTVL = eklUsdtLpBalance / 1e6 * eklUsdtLpPrice;

    const eklFarmTVL = eklKlayTVL + eklUsdtTVL;
    const TotalTVL = TMoonSwapTVL + FMoonSwapTVL + gaugeTVL + eklTVL + eklFarmTVL;
    return TotalTVL;
}

module.exports = {
  fetch: main
}
