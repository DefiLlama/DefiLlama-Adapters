const index = require("../olympus/index");
const ethereum = { ...index.ethereum };

delete ethereum.staking
delete ethereum.borrowed

module.exports = { ...index, ethereum };
