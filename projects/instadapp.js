const retry = require('./helper/retry')
const axios = require("axios");
const {parse} = require("node-html-parser");

async function fetch() {
  const rawPage = (await retry(async bail => await axios.get('https://instadapp.io/'))).data
  const root = parse(rawPage)
  const rawTextTvl = root.querySelector('.leading-none.my-6').childNodes[0].rawText;
  return parseInt(rawTextTvl.trim().substr(1).split(',').join(''))
}

module.exports = {
  timetravel: false,
  fetch
}
