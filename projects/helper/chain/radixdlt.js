const { post } = require('../http')

async function getBalance(component) {
  body = {
    "addresses": [component]
  }
  let balance = 0;  
  const data = await post(`https://rcnet-v3.radixdlt.com/state/entity/details`, body)
  const fungible_resources =  data["items"][0]["fungible_resources"]["items"]
  for (const item of fungible_resources) {
    balance += item.amount
  }
  return balance;
}


module.exports = {
  getBalance,
}
