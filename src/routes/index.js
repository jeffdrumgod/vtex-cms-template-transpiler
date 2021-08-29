const { templateParse } = require('../template-parser/index');

const routes = {
  templates: [
    {
      name: 'Apresentação de template renderizado',
      route: '/:folder_name/:file_name',
      method: 'get',
      handler: templateParse,
    },
  ],
};

module.exports = routes;
