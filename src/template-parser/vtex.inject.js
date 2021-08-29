const { HTMLParse } = require('../helpers/html.parser');
const VtexCmsMockedControllers = require('vtex-cms-mocked-controllers');
/**
 * Injeta trechos de código dentro do HTML de acordo com configuração da base de dados
 *
 * @param {string} html HTML a ser tratado
 * @returns {Promise}
 */
const injectScripts = async ({ fileUrl, folderUrl, file_name, vtex, html }) => {
  const injects = await VtexCmsMockedControllers.getListTemplateInjections();

  if (injects?.length) {
    const $htmlObject = HTMLParse(html);
    const insertInner = ['prepend', 'append', 'html'];
    const insertSibblings = ['insertBefore', 'insertAfter'];
    const $body = $htmlObject.querySelector('body');

    let $el;
    for (const injectObj of injects) {
      if (injectObj.page_type.includes($body.attr('data-page-type'))) {
        switch (true) {
          case insertInner.includes(injectObj.type_insert):
            $el = $htmlObject.querySelector(injectObj.selector);

            if (injectObj.selector_index === ':last') {
              $el = $el.last();
            } else {
              $el = $el.eq(injectObj.selector_index);
            }

            if ($el.length) {
              $el[injectObj.type_insert](injectObj.html);
            }

            break;
          case insertSibblings.includes(injectObj.type_insert):
            $el = $htmlObject.querySelector(injectObj.selector);

            if (injectObj.selector_index === ':last') {
              $el = $el.last();
            } else {
              $el = $el.eq(injectObj.selector_index);
            }

            if ($el.length) {
              $htmlObject[injectObj.type_insert](injectObj.html, $el);
            }
            break;
        }
      }
    }

    return $htmlObject.html();
  }

  return html;
};

module.exports = { injectScripts };
