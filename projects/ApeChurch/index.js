const { sumTokens2 } = require('../helper/unwrapLPs');
const { nullAddress } = require('../helper/tokenMapping');

const USER_CONTRACT = '0x6EA76F01Aa615112AB7de1409EFBD80a13BfCC84';
const HOUSE_CONTRACT = '0x2054709F89F18a4CCAC6132acE7b812E32608469';

async function volume(api) {
    const totalVolume = await api.call({
      abi: 'erc20:totalSupply',
      target: USER_CONTRACT,
      params: [],
    });
  
    api.add(USER_CONTRACT, totalVolume)
    return totalVolume
}

async function tvl(api) {
    return sumTokens2({ owner: HOUSE_CONTRACT, tokens: [nullAddress], api, })
}

module.exports = {
  methodology: `Ape Church TVL is achieved by tracking the balance of The House smart contract. Volume is achieved by tracking the Transfer events from the UserInfoTracker smart contract.`,
  start: 1757586225,
  apechain: {
    volume,
    tvl
  }
}
