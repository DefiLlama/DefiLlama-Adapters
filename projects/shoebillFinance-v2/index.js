const { compoundExports2 } = require("../helper/compound");
const { mergeExports } = require("../helper/utils");
const { aaveExports } = require("../helper/aave");

module.exports = mergeExports([
    {
        klaytn: compoundExports2({
            comptroller: "0xEE3Db1711ef46C04c448Cb9F5A03E64e7aa22814",
            cether: "0xac6a4566d390a0da085c3d952fb031ab46715bcf",
        }),
    },
    {
        wemix: compoundExports2({
            comptroller: "0xBA5E3f89f57342D94333C682e159e68Ee1Fc64De",
            cether: "0xD42ad8346d14853EB3D30568B7415cF90C579D83",
        }),
    },
    {
        manta: compoundExports2({
            comptroller: "0x9f53Cd350c3aC49cE6CE673abff647E5fe79A3CC",
            cether: "0xE103F874B2D144C5B327FA3d57069Bb19c0779e2",
        }),
    },
    {
        manta: compoundExports2({
            comptroller: "0x3413Dc597aE3bE40C6f10fC3D706b884eaCF470A",
        }),
    },
    {
        manta: compoundExports2({
            comptroller: "0x4e4b415F5aa78a44CE1fc259D2cEc47BF50A9216",
        }),
    },
    {
        mode: compoundExports2({
            comptroller: "0x9f53Cd350c3aC49cE6CE673abff647E5fe79A3CC",
            cether: "0xD13bE8b716b18265e294831FCb1330d170840BB3",
        }),
    },
    {
        metis: compoundExports2({
            comptroller: "0x9f53Cd350c3aC49cE6CE673abff647E5fe79A3CC",
            cether: "0x386adCa3c7D5C90523287933B05919aFcC2883dE",
        }),
    },
    {
        bsquared: compoundExports2({
            comptroller: "0x80E81348D9386Eb4d10c2A32A7458638cD3308dF",
            cether: "0x8dbf84c93727c85DB09478C83a8621e765D20eC2",
        }),
    },
    {
        bsquared: compoundExports2({
            comptroller: "0x9f53Cd350c3aC49cE6CE673abff647E5fe79A3CC",
        }),
    },
    {
        bob: compoundExports2({
            comptroller: "0x9f53Cd350c3aC49cE6CE673abff647E5fe79A3CC",
            cether: "0xb4255533Ad74A25A83d17154cB48A287E8f6A811",
        }),
    },
    {
        bob: compoundExports2({
            comptroller: "0xB7ed6c062caAaCb1A13f317E0A751289280FC306",
        }),
    },    
    {
        bob: compoundExports2({
            comptroller: "0x1e514767F5cFe1ddE599dd39a79666E3BeEAaf7d",
        }),
    },   
    {
        kroma: compoundExports2({
            comptroller: "0x9f53Cd350c3aC49cE6CE673abff647E5fe79A3CC",
            cether: "0xD13bE8b716b18265e294831FCb1330d170840BB3",
        }),
    }, 
    {
        fuse: compoundExports2({
            comptroller: "0x9f53Cd350c3aC49cE6CE673abff647E5fe79A3CC",
            cether: "0xD13bE8b716b18265e294831FCb1330d170840BB3",
        }),
    }, 
    {
        zklink: compoundExports2({
            comptroller: "0x89e348e0ab4D83aEDbf1354004552822a805a12e",
            cether: "0x4dA697a89ea1D166881362b56E6863294820eC97",
        }),
    }, 
    {
        zeta: aaveExports(undefined, undefined, undefined, ['0x2B6647f63f6Fab5c73e96FBf974f4ed2AB8a4308'], { v3: true })
    }

]);
