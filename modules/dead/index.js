const deadConfig = require('./config.json')
const { unMockFunctions } = require('../util')
const modules = {}

Object.entries(deadConfig).forEach(([key, value]) => {
  modules[key] = unMockFunctions(value)
})

module.exports = modules