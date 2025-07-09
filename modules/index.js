const deadConfig = require('./uni-v2/config.json')
const { unMockFunctions } = require('./util')
const modules = {}

Object.entries(deadConfig).forEach(([key, value]) => {
  modules[key] = unMockFunctions(value)
})

module.exports = modules