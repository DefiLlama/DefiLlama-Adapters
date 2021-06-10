const utils = require('./helper/utils');

async function fetch() {
  let response = await utils.fetchURL('https://r09ff9zcb2.execute-api.ap-northeast-1.amazonaws.com/dev/getTVL')
  return parseFloat(response.data);
}

module.exports = {
  fetch
}
