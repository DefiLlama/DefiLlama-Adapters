function flattenOnce(array) {
  return array.reduce((memo, el) => {
    return [...memo, ...el];
  }, []);
}

module.exports = {
  flattenOnce,
};
