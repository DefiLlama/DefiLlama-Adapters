const { sumTokens2, sumTokensExport, } = require('../helper/unwrapLPs')
const Helper = require("./Helper.js");
const { getWithMetadata } = require('../helper/http')
const { farms: { MasterChefAddress, LockStakingAddress }, abi, token: { XWIN }  } = require('./Helper.js');

async function getStrategyFunds(chain) {
  let strategyUrl = "";
  let portfolioUrl = "";

  if (chain === "bsc"){
    strategyUrl = Helper.StrategyURL.bsc
    portfolioUrl = Helper.PortfolioURL.bsc
  }
  else if (chain === "arbitrum"){
    strategyUrl = Helper.StrategyURL.arb
    portfolioUrl = Helper.PortfolioURL.arb
  }
  else if (chain === "polygon"){
    strategyUrl = Helper.StrategyURL.polygon
  }

  const URL = {
    SrategyUrl: strategyUrl,
    PortfolioUrl: portfolioUrl,
  }

  return URL
}

async function tvl(api) {
  const URL = await getStrategyFunds(api?.chain)

  let vaults = []
  let vaults2 = []
  let vaultsInfo = await getWithMetadata(URL.SrategyUrl)
  for (let index = 0; index < vaultsInfo.data.length; index++) {
    vaults2.push(await vaultsInfo.data[index].contractaddress)
  }

  // Private Vault API returns all 3 chains
  let privateVault = await getWithMetadata(Helper.PrivateVault.Url);
  if(api?.chain === "bsc"){
    let vaultPortfolio = await getWithMetadata(URL.PortfolioUrl)
    for (let index = 0; index < vaultPortfolio.data.length; index++) {
      vaults2.push(await vaultPortfolio.data[index].contractaddress);
    }
    vaults = vaults2.concat(privateVault.data.BNB)
  }
  else if (api?.chain === "arbitrum"){
    let vaultPortfolio = await getWithMetadata(URL.PortfolioUrl)
    for (let index = 0; index < vaultPortfolio.data.length; index++) {
      vaults2.push(await vaultPortfolio.data[index].contractaddress);
    }
    vaults = vaults2.concat(privateVault.data.ARB);
  }
  // Polygon does not have a portfolio vault
  // Portfolio vault is included in the strategy vault
  else if (api?.chain === "polygon"){
    vaults = vaults2.concat(privateVault.data.Polygon)  
  } 

  const bals = await api.multiCall({  abi: 'uint256:getVaultValues', calls: vaults})
  const tokens = await api.multiCall({  abi: 'address:baseToken', calls: vaults})

  //Get Vault Values returns 18 decimals even if the base token is not
  //For loop that removes the extra zeros if the base token is not 18 decimals.

  for (let index = 0; index < tokens.length; index++) {
    let decimal = await api.call({abi: Helper.abi.decimals, target: tokens[index], chain: api?.chain,})
    if(Number(decimal) !== 18){
      let decimalDif = 18 - decimal;
      let balance = bals[index]
      bals[index] = balance.substring(0, balance.length - decimalDif);
    }
  }  
  api.addTokens(tokens, bals)
}

async function pool2(api) {
  const data = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfoMaster, target: MasterChefAddress, })
  return sumTokens2({ api, owner: MasterChefAddress, tokens: data.map(i => i[0]), resolveLP: true, blacklistedTokens: [XWIN, LockStakingAddress] })
}

module.exports = {
  bsc: {
    tvl,
    pool2,
    staking: sumTokensExport({ owners: [MasterChefAddress, LockStakingAddress], tokens: [XWIN]})
  },
  arbitrum: {
    tvl,
  },
  polygon: {
    tvl,
  }
};
