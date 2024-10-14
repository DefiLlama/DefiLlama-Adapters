const { aaveExports } = require("../helper/aave");

module.exports = {
  klaytn: aaveExports(undefined, undefined, undefined, ['0x3eFC37753ec2501b406F3443cFD8D406B52abEa6'], { v3: true })
}
