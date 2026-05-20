const { aaveExports } = require("../helper/aave");
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([
  {
    pharos: aaveExports("pharos", undefined, undefined, ['0xA91424C666193C2b2fb684E25dEadf03B333f49A'], {
      v3: true,
    }),
  },
]);
