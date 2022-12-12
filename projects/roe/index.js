const { aaveExports } = require("../helper/aave");

module.exports = {
  ethereum: aaveExports('ethereum', '0x0029B254d039d8C5C88512a44EAa6FF999296009', undefined, 
    ['0xC68A4F7764f5219f250614d5647258a17A51a6c7']),
  polygon: aaveExports('polygon', '0x1ceb99Acd9788bb7d7Ce4a90219cBb0627b008F9', undefined, 
    ['0xA0132fF55E4ee9818B2F2d769f6Ba5c14Cfe0DA4']),
};