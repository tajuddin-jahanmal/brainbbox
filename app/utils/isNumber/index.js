function isNumber(value) {
    // Regex to match valid numbers (both integers and floating points)
    const regex = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;
    return regex.test(value);
};

export default isNumber;