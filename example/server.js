const VtexCmsTemplateTranspiler = require('vtex-cms-template-transpiler');
const { vtex } = require('./package.json');

const props = {
  vtex,
  port: 3000,
  httpDebug: false,
  replaces: require('./vtexCmsTemplateTranspiler.replaces'),
};

VtexCmsTemplateTranspiler(props);
