const { sumTokens2} = require('../helper/unwrapLPs')
const { get } = require('../helper/http')
const { getTokenBalance, getTrxBalance } = require('../helper/chain/tron');
const sdk = require("@defillama/sdk");

const getBridgeContract = {
    'ethereum':'0xC707E0854DA2d72c90A7453F8dc224Dd937d7E82',
    'bsc':'0x75Ab1d50BEDBd32b6113941fcF5359787a4bBEf4',
    'heco':'0x2ead2e7a3bd88c6a90b3d464bc6938ba56f1407f',
    'okexchain':'0xE096d12D6cb61e11BCE3755f938b9259B386523a',
    'harmony':'0x32Fae32961474e6D19b7a6346524B8a6a6fd1D9c',
    'polygon':'0x9DDc2fB726cF243305349587AE2a33dd7c91460e',
    'kcc':'0xdb442dff8ff9fd10245406da9a32528c30c10c92',
    'cronos':'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5',
    'avax':'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5',
    'arbitrum':'0xf0E406c49C63AbF358030A299C0E00118C4C6BA5',
    'fantom':'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5',
    'metis':'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5',
    'iotex':'0xf0e406c49c63abf358030a299c0e00118c4c6ba5',
    'optimism':'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5',
    'klaytn':'0x3758aa66cad9f2606f1f501c9cb31b94b713a6d5',
    'smartbch':'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5',
    // 'enuls':'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5',
    'kava':'0x3758AA66caD9F2606F1F501c9CB31b94b713A6d5',
    'ethpow':'0x67b3757f20DBFa114b593dfdAc2b3097Aa42133E'
}
const tronBridgeContract = 'TXeFBRKUW2x8ZYKPD13RuZDTd9qHbaPGEN';

let tokensConfTest;
async function getTokensConf() {
  if (!tokensConfTest) {
    tokensConfTest = await get('https://assets.nabox.io/api/tvltokens');
  }
  return tokensConfTest
}

const createTvlFunction = (chain) => async (timestamp, block, chainBlocks) => {
  let conf = await getTokensConf();
  const bridgeContract = getBridgeContract[chain];
  const tokens = Object.values(conf[chain])
  const owners = [bridgeContract]
  let balances = await sumTokens2({ chain, block:chainBlocks[chain], tokens, owners, })
  return balances;
};

async function tronTvl() {
  let conf = await getTokensConf();
  const tokens = conf['tron'];
  const tokenKeys = Object.keys(conf['tron'])
  const balances = {}
  for ( let label of tokenKeys) {
    let token = tokens[label];
    if (token === 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb') {
      let trxBalance= await getTrxBalance(tronBridgeContract)
      trxBalance = Number(trxBalance.toString()) / (10 ** 6)
      sdk.util.sumSingleBalance(balances, label, trxBalance)
    } else {
      const tokenBalance= await getTokenBalance(token, tronBridgeContract)
      sdk.util.sumSingleBalance(balances, label, tokenBalance)
    }
  }
  return balances
}

module.exports = {
  methodology: "Assets staked in the pool and trading contracts",
  tron: {
    tvl: tronTvl
  }
}
for (const network of Object.keys(getBridgeContract)) {
  module.exports[network] = {
    tvl: createTvlFunction(network),
  };
}



