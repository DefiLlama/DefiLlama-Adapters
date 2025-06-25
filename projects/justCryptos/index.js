const { get } = require('../helper/http');

let nowDate = new Date();
nowDate.setFullYear(nowDate.getFullYear() - 1);
let T = parseInt(nowDate.getTime() / 1000);

const url = "https://apilist.tronscan.org/api/defiTvl?type=tvlline&project=&startTime=" + T;

function getItemByName (projectName, listArr) {
  for (let i = 0; i < listArr.length; i++) {
    if (listArr[i].project === projectName) {
      return listArr[i];
    }
  }
}

const tvl = async (api) => {
  const pools = await get(url);
  let item = getItemByName('Just Cryptos', pools.projects)
  return api.addUSDValue(Math.round(item.locked))
}

module.exports = {
  misrepresentedTokens: true,
  tron: { tvl }
}