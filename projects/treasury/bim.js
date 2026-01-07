const { treasuryExports } = require("../helper/treasury");

const treasuryAddress = "0xcc0516d2B5D8E156890D894Ee03a42BaC7176972";

module.exports = treasuryExports({
    base: { owners: [treasuryAddress], ownTokens: ['0x555FFF48549C1A25a723Bd8e7eD10870D82E8379']},
    optimism: { owners: [treasuryAddress], },
    xdai: { owners: [treasuryAddress] },
    polygon: { owners: [treasuryAddress] },
    bsc: { owners: [treasuryAddress] },
    arbitrum: { owners: [treasuryAddress] },
    ethereum: { owners: [treasuryAddress] }
})