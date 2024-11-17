const plimit = require("p-limit");

const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))

module.exports = {
  rateLimited,
}