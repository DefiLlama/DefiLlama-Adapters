const { Program }  = require("@coral-xyz/anchor");
const { getProvider, sumTokens2 } = require('../helper/solana')

const UmbraAmmIDL = require("./idls/umbra_amm.json");
const AmmV3IDL = require("./idls/amm_v3.json");

module.exports = {
  timetravel: false,
  methodology:"Get USD value of the TVL from the API",
  eclipse: {
    tvl: tvlOnChain,
  },
};

async function processTvlOnChainCpmm(api) {
  const provider = getProvider("eclipse")
  const cpmmProgram = new Program(UmbraAmmIDL, provider)

  const cpmmPoolStates = await cpmmProgram.account.poolState.all()
  
  const tokenAccounts = cpmmPoolStates.map(({ account: { token0Vault, token1Vault }}) => ([token0Vault, token1Vault,])).flat()
  
  return sumTokens2({ tokenAccounts, api })
}

async function processTvlOnChainClmm(api) {
  const provider = getProvider("eclipse")
  const clmmProgram = new Program(AmmV3IDL, provider)

  const clmmPoolStates = await clmmProgram.account.poolState.all()
  
  const tokenAccounts = clmmPoolStates.map(({ account: { tokenVault0, tokenVault1 }}) => ([tokenVault0, tokenVault1,])).flat()

  return sumTokens2({ tokenAccounts, api })
}

async function tvlOnChain(api) {
  await processTvlOnChainCpmm(api)
  await processTvlOnChainClmm(api)
}
