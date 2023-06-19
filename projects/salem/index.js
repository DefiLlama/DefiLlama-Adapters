const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { stakingUnknownPricedLP } = require("../helper/staking");
const { pool2Exports, pool2 } = require("../helper/pool2");

const croSalem = "0x637CB66526244029407046867E1E0DFD28b2294E";
const ftmSalem = "0xa26e2D89D4481500eA509Df58035073730cff6D9";
const polySalem = "0xf5291e193aad73cac6fd8371c98804a46c6c6577";

const cronoschef = "0xBD124D3B18a382d807a9E491c7f1848403856B08";
const ftmchef = "0xdA2A9024D8D01F4EA0aa35EEdf771432095219ef";
const polychef = "0x53D392646faB3caE0a08Ead31f8B5cBFFf55b818";

const cronosPool2 = [
    "0x03F297457ED6197D0A387a5C53dC72aCf8fDB3FC",
    "0x4A84e3CcC9Ac08D5cAE6765B45CF7c6Ab287AAD9"
]

const polyPool2 = [
    "0x32c8756821cF90928262D2D0Ef7D5Bc6608A8A47",
    "0x131db18FE666370B377A7408bC756d6c6737885b"
]

const ftmPool2 = [
    "0x79Bf4a0E0Cc1e52B7D3018a8a4d9b8640A09edB0",
    "0xe83E9BDA9a863aa898d4c8F10233f2Ed0c86363D"
]

const translate = {
    [ADDRESSES.moonriver.USDT]: "fantom:" + ADDRESSES.fantom.WFTM,
    "0xf2001b145b43032aaf5ee2884e456ccd805f677d": ADDRESSES.ethereum.DAI,
    "0x7dff46370e9ea5f0bad3c4e29711ad50062ea7a4": "bsc:0x570a5d26f7765ecb712c0924e4de545b89fd43df"
};

async function cronosTvl(timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, cronoschef, chainBlocks.cronos, "cronos", addr=>{
        addr = addr.toLowerCase();
        if (translate[addr] !== undefined) {
            return translate[addr];
        }
        return `cronos:${addr}`;
    }, undefined, [croSalem], true, true, croSalem);
    return balances;
}


async function ftmTvl(timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, ftmchef, chainBlocks.fantom, "fantom", addr=>`fantom:${addr}`, undefined, [ftmSalem], true, true, ftmSalem);
    return balances;
}


async function polyTvl(timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, polychef, chainBlocks.polygon, "polygon", addr=>{
        addr = addr.toLowerCase();
        if (translate[addr] !== undefined) {
            return translate[addr];
        }
        return `polygon:${addr}`
    }, undefined, [polySalem], true, true, polySalem);
    return balances;
}


module.exports = {
    cronos: {
        tvl: cronosTvl,
        staking: stakingUnknownPricedLP(cronoschef, croSalem, "cronos", "0x4A84e3CcC9Ac08D5cAE6765B45CF7c6Ab287AAD9"),
        pool2: pool2Exports(cronoschef, cronosPool2, "cronos")
    },
    fantom: {
        tvl: ftmTvl,
        staking: stakingUnknownPricedLP(ftmchef, ftmSalem, "fantom", "0xe83E9BDA9a863aa898d4c8F10233f2Ed0c86363D"),
        pool2: pool2Exports(ftmchef, ftmPool2, "fantom")
    },
    polygon: {
        tvl: polyTvl,
        staking: stakingUnknownPricedLP(polychef, polySalem, "polygon", "0x131db18FE666370B377A7408bC756d6c6737885b"),
        pool2: pool2Exports(polychef, polyPool2, "polygon")
    },
    
}