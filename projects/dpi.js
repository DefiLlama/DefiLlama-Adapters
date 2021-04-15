const utils = require('./helper/utils')

async function fetch() {
    const dpiAddress = "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b";
    const fliAddress = "0xaa6e8127831c9de45ae56bb1b0d4d4da6e5665bd";
    const mviAddress = "0x72e364f2abdc788b7e918bc238b21f109cd634d7";
    const cgiAddress = "0xada0a1202462085999652dc5310a7a9e2bf3ed42";
    
    const addresses = [ dpiAddress, fliAddress, mviAddress, cgiAddress ];
    
    return addresses.reduce(async (sum, address) => await sum + await getCaps(address), 0);
}

async function getCaps(address) {
    return (await utils.getTokenPricesFromString(address)).data[address].usd_market_cap;
}

module.exports = {
    fetch
}
