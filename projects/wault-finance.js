const { default: Axios } = require("axios");

async function fetch() {
  try {
    let response = await Axios.get(
      "https://api.prod.euler.tools/customers/wswap/pairs"
    );
    return response.data.reduce((a, b) => a + parseFloat(b.liquidity.toFixed()), 0);
  } catch (e) {
    console.log(e);
    return 0;
  }
}

module.exports = {
  fetch,
};
