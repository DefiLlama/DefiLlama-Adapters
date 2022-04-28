const http = require("./http");

const baseURL = "https://api.tzkt.io/v1";
const api = http(baseURL);

const getXtzPrice = async () => api.get("quotes/last");

module.exports = {
  getXtzPrice,
};
