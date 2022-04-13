const axios = require("axios");

module.exports = (baseURL, options = {}) => {
  const defaultOptions = {
    baseURL,
  };

  const opts = Object.assign({}, defaultOptions, options);

  const http = axios.create(opts);

  http.interceptors.response.use((response) => {
    const { data } = response;

    if (typeof data === "object" && !Array.isArray(data) && data !== null) {
      if ("data" in data) return data.data.data;
    }

    return data;
  });

  return http;
};
