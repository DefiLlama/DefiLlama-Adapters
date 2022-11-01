const {compoundExports} = require('../helper/compound')

const wCRO = "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23";
const cCRO = "0xff024211741059a2540b01f5Be2e75fC0c1b3d82";

module.exports = {
    cronos: {
        ...compoundExports(
            "0x30dF4C58ADaf1FcF388B7Bf775840DEc086dcB98",
            "cronos",
            cCRO,
            wCRO,
            addr => `cronos:${addr}`,
        ),
    }
}