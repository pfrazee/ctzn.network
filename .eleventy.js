module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("webfonts");

  eleventyConfig.addLiquidFilter("prettyjson", function(value) {
    return JSON.stringify(value, null, 2)
  });
};