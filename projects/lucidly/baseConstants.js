const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Base = [
    {
        name: "Stable Yield USD",
        vault: "0x279CAD277447965AF3d24a78197aad1B02a2c589",
        accountant: "0x03D9a9cE13D16C7cFCE564f41bd7E85E5cde8Da6",
        teller: "0xaefc11908fF97c335D16bdf9F2Bf720817423825",
        lens: "0x074F543E7DaA7C67F77bfD8C41C79127c4dd80d9",
        startBlock: 30004947,
        baseAsset: ADDRESSES.base.USDC,
    },
];

module.exports = {
    boringVaultsV0Base,
};
