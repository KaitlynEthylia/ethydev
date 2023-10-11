const mdIt = require('markdown-it');
const mdItAnchor = require('markdown-it-anchor');
const toc = require('eleventy-plugin-toc');

module.exports = (eleventyConfig) => {
	eleventyConfig.setUseGitIgnore(false);
	eleventyConfig.addPassthroughCopy("styles");
	eleventyConfig.addPassthroughCopy("resources");
	eleventyConfig.setLibrary('md', mdIt({
		html: true,
		typographer: true
	}).use(mdItAnchor));
	eleventyConfig.addPlugin(toc, { ul: true });
};
