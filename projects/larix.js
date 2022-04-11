const { fetchURL } = require("./helper/utils");

const api = "https://api.projectlarix.com/market";

async function fetch() {
  const data = (await fetchURL(api)).data.total_available_value;
  console.log(data)
  return data;
}

module.exports = {
  fetch
}