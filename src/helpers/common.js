const fs = require('fs');

const parseJsonProps = (content, fields = ['props']) => {
  fields.forEach((field) => {
    if ((content || {})[field]) {
      try {
        Object.assign(content, {
          [field]: JSON.parse(content[field]),
        });
      } catch (e) {
        console.error('parseJsonProps error:', e);
        Object.assign(content, {
          [field]: {},
        });
      }
    }
  });
  return content;
};

const loadHtmlFromFileURL = async function (filePath) {
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch (err) {
    // console.log(err);
    return null;
  }
};

const checkFileExists = (file) => {
  return fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
};

const toMoney = (price, CultureCode, ISOCurrencySymbol) => {
  return price.toLocaleString(CultureCode || 'pt-BR', {
    style: 'currency',
    currency: ISOCurrencySymbol || 'BRL',
  });
};

const kebabCase = (text = '') => {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join('-');
};

const pageTypes = [
  'account',
  'brand',
  'category',
  'content',
  'departament',
  'home',
  'login',
  'orders',
  'product',
  'productlist',
  'search',
];

module.exports = {
  toMoney,
  kebabCase,
  pageTypes,
  loadHtmlFromFileURL,
  parseJsonProps,
  checkFileExists,
};
