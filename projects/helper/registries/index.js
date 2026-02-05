const deadAdapters = require('./deadAdapters.json');
const allProtocols = {
  ...deadAdapters,
}

module.exports = {
  allProtocols,
  deadAdapters,
};