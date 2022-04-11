const BigNumber = require("bignumber.js");
module.exports = class Result {
    constructor(obj) {
        this.result = obj;
    }

    append(obj) {
        for (const key in obj) {
            if (this.result.hasOwnProperty(key)) {
                BigNumber.config({EXPONENTIAL_AT: 100});
                const sum = (new BigNumber(this.result[key])).plus(new BigNumber(obj[key]));
                this.result[key] = sum.valueOf();
            } else {
                this.result[key] = obj[key];
            }
        }
        return this;
    }

    render() {
        return this.result;
    }
}
