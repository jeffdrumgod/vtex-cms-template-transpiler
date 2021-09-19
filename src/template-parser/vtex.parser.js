const { HTMLParse } = require('../helpers/html.parser');
const methodsReplace = require('./vtex.methodsReplace');
const { pageTypes } = require('../helpers/common');
const { fixValidTags } = methodsReplace;
const { injectScripts } = require('./vtex.inject');
const _ = require('lodash');

/**
 * Valida se existe alguma tag HTML no código enviado
 *
 * @param {string} html
 */
const hasVtexTags = (html = '') => {
  const $doc = fixValidTags(html);
  const $document = HTMLParse($doc);

  return !!$document.hasTag('script[type="vtex"]');
};

/**
 * Abstrai as tags Vtex do HTML com seus atriutos para posterior substituição
 *
 * @param {htmlParset Object} html HTML a ser tratado
 * @returns {Promise} Resolve object com o object Html parseado e a lista das tags em formato array
 *
 * _resolve({ **$document**, **tags** })_
 */
const parseVtexTags = async ($document) => {
  const tag = 'script[type="vtex"]';
  const $vtexTags = $document.querySelector(tag);
  const tags = [];

  if (!$vtexTags.length) {
    console.log('Nenhuma tag vtex encontrada no document');
    return {
      $document,
      tags,
    };
  }

  $vtexTags.each((i, e) => {
    const $this = $document.querySelector(e);
    let method = 'getController';
    switch ($this.attr('tagname')) {
      case 'contentPlaceHolder':
        method = 'getVtexContentPlaceHolder';
        break;
      case 'template':
        method = 'getVtexSubTemplate';
        break;
      default:
        break;
    }
    const replaceTagId = _.uniqueId();

    $this.attr('data-replacetagid', replaceTagId);

    tags.push({
      method,
      attrs: Object.assign(
        {
          tag,
          replaceTagId,
        },
        $this[0].attribs,
      ),
    });
  });

  return { $document, tags };
};

/**
 * Substitui tags Vtex do HTML passado como parâmetro por trechos de HTML final para renderizar o layout
 *
 * @param {string} html HTML a ser tratado
 */
const vtexReplaceTags = async ({ fileUrl, folderUrl, file_name, html, vtex }) => {
  const $mainDoc = HTMLParse(html);
  const rest = await parseVtexTags($mainDoc);

  let { $document } = rest;
  const { tags } = rest;

  if (!tags.length) {
    return $document.html();
  }

  for (const tag of tags) {
    if (methodsReplace.hasOwnProperty(tag.method)) {
      $document = await methodsReplace[tag.method]({
        fileUrl,
        folderUrl,
        file_name,
        vtex,
        $document,
        tag,
      });
    } else {
      console.log(`Method replace not exist: ${tag.method}`);
    }
  }

  return $document ? $document.html() : '';
};

const recursiveReplaceTags = async ({ fileUrl, folderUrl, file_name, html, vtex }, depth = 0) => {
  depth = depth + 1;
  if (depth > 4) {
    return html;
  }

  html = fixValidTags(html);

  if (hasVtexTags(html)) {
    html = await vtexReplaceTags({ fileUrl, folderUrl, file_name, html, vtex });
    return await recursiveReplaceTags({ fileUrl, folderUrl, file_name, html, vtex }, depth);
  }

  return html;
};

const replaceSimpleContents = async ({ project, html, DB }) => {
  const replaces = await DB.select().from('replaces').where({ project_id: project.id, active: 1 }).all();

  if (replaces.rows.length) {
    for (const replace of replaces.rows) {
      const reg = new RegExp(replace.replace_from, replace.replace_flags || 'g');
      html = html.replace(reg, replace.replace_to);
    }
  }

  const replacesProject = await DB.select().from('vtex_replaces').where({ active: 1 }).all();

  if (replacesProject.rows.length) {
    for (const replace of replacesProject.rows) {
      const reg = new RegExp(replace.replace_from, replace.replace_flags || 'g');
      html = html.replace(reg, replace.replace_to);
    }
  }

  return html;
};

/**
 * Substutir variáveis de sistema para renderização do html final
 *
 * @param {string} html HTML a ser tratado
 * @returns {string}}
 */
const replaceStoreVariables = async ({ fileUrl, folderUrl, file_name, vtex, html }) => {
  return (html || '')
    .replace(/\{\{STORE_NAME\}\}/g, vtex.escapedName)
    .replace(/\{\{STORE_ID\}\}/g, vtex.store)
    .replace(/\{\{SCOPE_ID\}\}/g, vtex.scopeId)
    .replace(/\{\{STORE_URL_VTEX\}\}/g, `//${vtex.store}.${vtex.environment}/`)
    .replace(/\{\{STORE_DOMAIN_VTEX\}\}/g, `${vtex.store}.${vtex.environment}`)
    .replace(/\{\{STORE_DOMAIN_STATICS\}\}/g, '/arquivos/');
};

const reverseReplacedTags = (html) =>
  (html || '').replace(
    /<parsegenerator data-ignore-in-generator="true">([^\0]*?)<\/parsegenerator>/gm,
    '<noscript data-ignore-in-generator="true">$1</noscript>',
  );

const parseVtexHTMLTemplate = async function ({ fileUrl, folderUrl, file_name, vtex, html }) {
  const $mainDoc = HTMLParse(html);
  const $body = $mainDoc.querySelector('body');
  const pageType = $body.attr('data-page-type');

  if (!pageType || !pageTypes.includes(pageType)) {
    return `<p>Essa página não possui uma tag body com atributo "data-page-type" válido. Para que o gerador funcione corretamente você deve atribuir um tipo de página válido:</p>
      <ul>${pageTypes.map((item) => `<li>${item}</li>`).join('')}</ul>`;
  }

  // alteração de tags recursivamente
  html = await recursiveReplaceTags({
    fileUrl,
    folderUrl,
    file_name,
    vtex,
    html,
  });

  // injetar scripts padrões para tipo de página
  html = await injectScripts({
    fileUrl,
    folderUrl,
    file_name,
    vtex,
    html,
  });

  // // trocar variáveis internas de sistema
  html = await replaceStoreVariables({
    fileUrl,
    folderUrl,
    file_name,
    vtex,
    html,
  });

  // retroceder variáveis que devem ser ignoradas
  html = reverseReplacedTags(html);

  // html = await replaceSimpleContents({
  //   DB,
  //   html,
  //   project,
  // });

  return html;
};

module.exports = { parseVtexHTMLTemplate };
