const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')
const abis = require('../config/strips-finance/abis.js')
const web3 = require('../config/strips-finance/web3.js')
const BN = require("bignumber.js");


const initContracts = (web3) => {
    const network = 42161;
    const getContract = (_contract) => ({
        abi: abis.stripsFinanceABI,
        address: _contract,
      });


    const ftxBTC = getContract('0x0CfB5ccC02E42F6C485AE826de1C42B3C16eafa8')
    const binanceBTC = getContract('0x594C8612562f7578c3d45bf022c3b7f2154f3a2E')
    const aaveMarket = getContract('0x9D8Afe7e5093f56D7929ab8Fc1A3A912343E5Ccc')
    const sofrMarket = getContract('0x8C72Db65d82D34386e34980a99ab1EbAf322a64B')
    const insurance = getContract('0x5D623170f81E485e43841881F07B69e968CFf55a')

    return {
        ftxBTC: new web3.eth.Contract(ftxBTC.abi, ftxBTC.address),
        binanceBTC: new web3.eth.Contract(binanceBTC.abi, binanceBTC.address),
        aaveMarket: new web3.eth.Contract(aaveMarket.abi, aaveMarket.address),
        sofrMarket: new web3.eth.Contract(sofrMarket.abi, sofrMarket.address),
        insurance: new web3.eth.Contract(insurance.abi, insurance.address),
    }
} 

const getMarketdata = async (contracts) => {
    let liquidityFTX = await contracts.ftxBTC.methods.getLiquidity().call();
    let liquidityBinance = await contracts.binanceBTC.methods.getLiquidity().call();
    let liquidityAave = await contracts.aaveMarket.methods.getLiquidity().call();
    let liquiditySofrMarket = await contracts.sofrMarket.methods.getLiquidity().call();
    let liquidityInsurance = await contracts.insurance.methods.getLiquidity().call();

    return  new BN(liquidityFTX + liquidityBinance +  liquidityAave  + liquidityInsurance + liquiditySofrMarket) 
}

async function fetch() {
    const contracts = initContracts(web3);
    const marketTVL = await getMarketdata(contracts);
    const ammTvl = await calculateUsdUniTvl(
        "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
            "arbitrum",
            "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            [],
            "weth"
        )
    
    
    return marketTVL 
 }


module.exports = {
    fetch,
    misrepresentedTokens: true,
    arbitrum: {
      tvl: calculateUsdUniTvl(
        "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
        "arbitrum",
        "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        [],
        "weth"
      ),
    },
    methodology:
      "Factory addresses on  Arbitrum are used to find the LP pairs. TVL is equal to liquidity in AMM together with the sum of Liquidity in insurence and Fundings Markets",
  };
  