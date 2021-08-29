const { resolve } = require('path');
const { loadHtmlFromFileURL } = require('../helpers/common');
const { parseVtexHTMLTemplate } = require('./vtex.parser');

const templateParse = ({ templateDirectory, vtex }, req, res) => {
  const { folder_name, file_name } = (req || {}).params || {};

  (async () => {
    const fileUrl = resolve(templateDirectory, folder_name, file_name);
    const folderUrl = resolve(templateDirectory, folder_name);

    const html = await loadHtmlFromFileURL(fileUrl);

    const formatedHtml = await parseVtexHTMLTemplate({
      fileUrl,
      folderUrl,
      file_name,
      vtex,
      html,
    });

    res.send(formatedHtml || 'Arquivo não encontrado');
  })();
};

module.exports = { templateParse };
