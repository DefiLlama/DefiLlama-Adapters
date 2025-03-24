const { Program }  = require("@coral-xyz/anchor");
const { PublicKey } = require("@solana/web3.js");

const { get } = require('../helper/http')
const { getProvider, sumTokens2 } = require('../helper/solana')

const UmbraAmmIDL = require("./idls/umbra_amm.json");
const AmmV3IDL = require("./idls/amm_v3.json");

const CPMM_PROGRAM_ID = new PublicKey("CPMMQoayoCZGUq4wQRxrPBNrrExU6PLg1eEAXC83KDzv");
const CLMM_PROGRAM_ID = new PublicKey("CLMMjQ8usCDmeP2hZFc6Mhih7JFbjg6mHeRxeEtTWHNf");

module.exports = {
  timetravel: false,
  methodology:"Get USD value of the TVL from the API",
  eclipse: {
    tvl: tvlOnChain,
  },
};
// node test.js projects/umbra/index.js

async function tvlApi(api) {
  const data = await get("https://api.umbra.finance/1/explore/tvl")
  const tvlValue = data.result[data.result.length - 1]?.data ?? 0
  return api.addUSDValue(tvlValue)
}

async function processTvlOnChainCpmm(api) {
  const provider = getProvider("eclipse")
  const cpmmProgram = new Program(UmbraAmmIDL, provider)

  const cpmmPoolStates = await cpmmProgram.account.poolState.all()
  console.log(`✨got cpmmPoolStates address=${UmbraAmmIDL.address} length=${cpmmPoolStates.length}`)
  
  const tokenAccounts = cpmmPoolStates.map(({ account: { token0Vault, token1Vault }}) => ([token0Vault, token1Vault,])).flat()
  
  return sumTokens2({ tokenAccounts, api })
}

async function processTvlOnChainClmm(api) {
  const provider = getProvider("eclipse")
  const clmmProgram = new Program(AmmV3IDL, provider)

  const clmmPoolStates = await clmmProgram.account.poolState.all()
  console.log(`✨got clmmPoolStates address=${AmmV3IDL.address} length=${clmmPoolStates.length}`)
  
  const tokenAccounts = clmmPoolStates.map(({ account: { tokenVault0, tokenVault1 }}) => ([tokenVault0, tokenVault1,])).flat()

  return sumTokens2({ tokenAccounts, api })
}

async function tvlOnChain(api) {
  await processTvlOnChainCpmm(api)
  await processTvlOnChainClmm(api)

  return api.getBalances();
}
