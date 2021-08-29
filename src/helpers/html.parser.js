const cheerio = require('cheerio');

/**
 * Canivete suiço para parse do HTML
 *
 * @param {String} html
 * @param {Object} options
 */
const HTMLParse = function HTMLParse(html, options = {}) {
  const that = {};

  const config = {
    normalizeWhitespace: true,
    recognizeSelfClosing: true,
    decodeEntities: true,
    useHtmlParser2: true,
  };

  that.document = null;

  that.insertBefore = (html, selector) => {
    if (that.document) {
      that.document(html).insertBefore(selector);
    }

    return that;
  };

  that.insertAfter = (html, selector) => {
    if (that.document) {
      that.document(html).insertAfter(selector);
    }

    return that;
  };

  that.load = (html, config) => {
    that.document = cheerio.load(html, config);

    return that;
  };

  that.hasTag = (tag) => {
    if (that.document) {
      return !!that.document(tag).length;
    }

    return false;
  };

  that.querySelector = (selector) => {
    if (that.document) {
      return that.document(selector);
    }

    return null;
  };

  that.html = () => {
    if (that.document) {
      return that.document.html();
    }

    return '';
  };

  return that.load(html, Object.assign(config, options));
};

module.exports = {
  HTMLParse,
};
