const getPropertyName = (str) => {
  if (str.includes("Material")) {
    return "Material";
  } else if (str.includes("Color")) {
    return "Color";
  } else if (str.includes("Size")) {
    return "Size";
  }
};

module.exports = {
  getPropertyName,
};
