const { get } = require('../helper/http')

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

async function fetch(){
    const pools = await get(url);
    let item = getItemByName('TRX Staking Governance', pools.projects);
    return parseInt(item.locked);
}

module.exports = {
  tron: {
    fetch
  },
    fetch
}