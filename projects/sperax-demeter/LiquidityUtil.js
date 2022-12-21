const BigNumber = require('bignumber.js');

const DEFAULT_PRICE_CALCULATE = 18;

function numberFormatAndGetApprox(_number, _decimals, _decimalPlacesStrategy, _defaultResult) {
    let number =
        _number && typeof _number === 'string' ? new BigNumber(_number) : new BigNumber(_number?._hex || _number || 0);
    let decimals = _decimals || 2;
    let strategy = _decimalPlacesStrategy || 1;
    let result = '';
    let approximation = '';
    let defaultResult = _defaultResult || '0';

    const adjustTheShowDecimals = (decimalBigNumber) => {
        const checkCurrentDecimals = (_decimalBigNumber, showDecimals) => {
            let exponent = new BigNumber(10).pow(showDecimals);
            let threshold = new BigNumber(1).div(exponent);

            if (_decimalBigNumber.comparedTo(threshold) < 0 && showDecimals < 8) {
                let _showDecimals = showDecimals + 2;
                return checkCurrentDecimals(_decimalBigNumber, _showDecimals);
            } else {
                return showDecimals;
            }
        };

        let _decimalBigNumber = decimalBigNumber;
        if (_decimalBigNumber.comparedTo(0) < 0) {
            _decimalBigNumber = _decimalBigNumber.times(-1);
        }
        return checkCurrentDecimals(_decimalBigNumber, decimals);
    };

    const valueToFormat = (resultBigNumber) => {
        if (resultBigNumber.toNumber() === 0) {
            result = defaultResult;
            approximation = defaultResult;
            return;
        }

        approximation = resultBigNumber.toFormat(decimals);

        let b = new BigNumber('1000000000');
        let m = new BigNumber('1000000');
        let k = new BigNumber('1000');
        let _k = new BigNumber('100000');

        let ROUND_DOWN = 1;

        if (resultBigNumber.comparedTo(b) >= 0) {
            let _resultBigNumber = resultBigNumber.div(b).decimalPlaces(decimals, ROUND_DOWN);
            result = `${_resultBigNumber.toFormat(decimals)} B`;
            return;
        }

        if (resultBigNumber.comparedTo(m) >= 0) {
            let _resultBigNumber = resultBigNumber.div(m).decimalPlaces(decimals, ROUND_DOWN);
            result = `${_resultBigNumber.toFormat(decimals)} M`;
            return;
        }

        if (resultBigNumber.comparedTo(_k) >= 0) {
            let _resultBigNumber = resultBigNumber.div(k).decimalPlaces(decimals, ROUND_DOWN);
            result = `${_resultBigNumber.toFormat(decimals)} K`;
            return;
        }

        result = resultBigNumber.toFormat(decimals);
    };

    decimals = adjustTheShowDecimals(number);

    let resultBigNumber = number.decimalPlaces(decimals, strategy);
    valueToFormat(resultBigNumber);

    return {
        result: result,
        approximation: approximation,
        resultBigNumber: resultBigNumber,
        resultBigNumberString: resultBigNumber.toFixed(),
    };
}

class Amount {
    value = 0;
    bigNumber = new BigNumber(0);
    formativeValue = '';
    formativeNumber = '';

    constructor(amount, decimals, decimalPlacesStrategy, defaultFormativeValue) {
        let { result, approximation, resultBigNumber } = numberFormatAndGetApprox(
            amount,
            decimals,
            decimalPlacesStrategy,
            defaultFormativeValue,
        );
        this.value = amount || 0;
        this.bigNumber = resultBigNumber;
        this.formativeValue = result;
        this.formativeNumber = approximation;
    }
}

function getPriceRange(tickLower, tickUpper, decimalA, decimalB, reversal) {
    let diffDecimals = decimalA >= decimalB ? decimalA - decimalB : decimalB - decimalA;
    let scale = new BigNumber(10).pow(diffDecimals);
    if (tickLower > -887220 && tickUpper < 887220) {
        let price1 = Math.pow(1.0001, tickLower) * scale.toNumber();
        let price1Bn = new Amount(price1, DEFAULT_PRICE_CALCULATE);
        let price2 = Math.pow(1.0001, tickUpper) * scale.toNumber();
        let price2Bn = new Amount(price2, DEFAULT_PRICE_CALCULATE);
        if (reversal) {
            price1Bn = new Amount(1 / price2, DEFAULT_PRICE_CALCULATE);
            price2Bn = new Amount(1 / price1, DEFAULT_PRICE_CALCULATE);
        }
        return [price1Bn.formativeValue, price2Bn.formativeValue, price1Bn, price2Bn];
    } else if (tickLower <= -887220 && tickUpper < 887220) {
        let price2 = Math.pow(1.0001, tickUpper) * scale.toNumber();
        let price1 = Math.pow(1.0001, tickLower) * scale.toNumber();
        let price2Bn = new Amount(price2, DEFAULT_PRICE_CALCULATE);
        if (reversal) {
            price2Bn = new Amount(1 / price2, DEFAULT_PRICE_CALCULATE);
            let price1Bn = new Amount(price1, DEFAULT_PRICE_CALCULATE);
            return [price2Bn.formativeValue, '∞', price2Bn, price1Bn];
        }
        return [0, price2Bn.formativeValue, new Amount(0, DEFAULT_PRICE_CALCULATE), price2Bn];
    } else if (tickLower > -887220 && tickUpper >= 887220) {
        let price1 = Math.pow(1.0001, tickLower) * scale.toNumber();
        let price2 = Math.pow(1.0001, tickUpper) * scale.toNumber();
        let price2Bn = new Amount(price2, DEFAULT_PRICE_CALCULATE);
        let price1Bn = new Amount(price1, DEFAULT_PRICE_CALCULATE);
        if (reversal) {
            price2Bn = new Amount(1 / price2, DEFAULT_PRICE_CALCULATE);
            let price1Bn = new Amount(price1, DEFAULT_PRICE_CALCULATE);
            return [price2Bn.formativeValue, '∞', price2Bn, price1Bn];
        }
        return [price1Bn.formativeValue, '∞', price1Bn, price2Bn];
    }
    if (tickLower <= -887220 && tickUpper >= 887220) {
        let price2 = Math.pow(1.0001, tickUpper) * scale.toNumber();
        let price2Bn = new Amount(price2, DEFAULT_PRICE_CALCULATE);
        return [0, '∞', new Amount(0, DEFAULT_PRICE_CALCULATE), price2Bn];
    }
}

function getSeparateAmountOfLiquidity(liquidity, perAtoB, tickLower, tickUpper, decimalA, decimalB) {
    let diffDecimals = decimalA >= decimalB ? decimalA - decimalB : decimalB - decimalA;
    let scale = new BigNumber(10).pow(diffDecimals);
    let [noUse1, noUse2, priceLow, priceHigh] = getPriceRange(tickLower, tickUpper, decimalA, decimalB);
    let liq = new BigNumber(liquidity);
    let perAtoBBn = new BigNumber(perAtoB || 0);
    let result0 = new BigNumber(0);
    let result1 = new BigNumber(1);

    if (perAtoBBn.comparedTo(priceLow.bigNumber) > 0 && perAtoBBn.comparedTo(priceHigh.bigNumber) < 0) {
        let result0Step1 = priceHigh.bigNumber.sqrt().minus(perAtoBBn.sqrt());
        let result0Step2 = perAtoBBn.sqrt().times(priceHigh.bigNumber.sqrt());
        let result1Step = perAtoBBn.sqrt().minus(priceLow.bigNumber.sqrt());
        result0 = liq.times(result0Step1.div(result0Step2));
        result1 = liq.times(result1Step);
    } else if (perAtoBBn.comparedTo(priceLow.bigNumber) < 0) {
        let result0Step1 = priceHigh.bigNumber.sqrt().minus(priceLow.bigNumber.sqrt());
        let result0Step2 = priceLow.bigNumber.sqrt().times(priceHigh.bigNumber.sqrt());
        result0 = liq.times(result0Step1.div(result0Step2));
        result1 = new BigNumber(0);
    } else if (perAtoBBn.comparedTo(priceHigh.bigNumber) > 0) {
        let result1Step = priceHigh.bigNumber.sqrt().minus(priceLow.bigNumber.sqrt());
        result0 = new BigNumber(0);
        result1 = liq.times(result1Step);
    }

    let p = 1;
    if (scale > 1) {
        p = Math.pow(10, decimalA >= decimalB ? decimalB : decimalA);
    }

    let amount0 = result0.times(p).decimalPlaces(0);
    let amount1 = result1.div(p).decimalPlaces(0);

    return [amount0, amount1];
}

module.exports = {
    getSeparateAmountOfLiquidity
}