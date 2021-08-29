const Handlebars = require('handlebars');
const glob = require('glob-promise');
const path = require('path');
const { resolve } = path;
const { loadHtmlFromFileURL, checkFileExists, kebabCase, toMoney } = require('../helpers/common');
const _ = require('lodash');
const VtexCmsMockedControllers = require('vtex-cms-mocked-controllers');
const { parseJsonProps } = require('../helpers/json');

let ListVtexControllers = [];
VtexCmsMockedControllers.getListControlers().then((controllers) => {
  ListVtexControllers = controllers;
});
/**
 * Substitui tags Vtex com tags validas de HTML5
 */
const fixValidTags = (html) => {
  return (html || '')
    .replace(/\<vtex.*\:([a-zA-Z]*)/g, '<vtex tagname="$1" ')
    .replace(/\<vtex(.*)\/\>/g, '<script type="vtex" $1></script>')
    .replace(
      /<noscript data-ignore-in-generator="true">([^\0]*?)<\/noscript>/gm,
      '<parsegenerator data-ignore-in-generator="true">$1</parsegenerator>',
    );
};

/**
 * Substitui um determinado conteúdo de dentro de um object document, com base nos atributos enviados como parametros
 * @param {cheerio Object} $doc
 * @param {Obejct} options
 * @param {String} html
 */
const replaceContent = ($doc, options, html) => {
  if ($doc && options.attrs.tag) {
    const $tag = $doc.querySelector(`[data-replacetagid="${options.attrs.replaceTagId}"]`);
    $tag.replaceWith(fixValidTags(html));
  }
  return $doc;
};

/**
 * Substitui um subtemplate dentro de um conteúdo document
 */
const getVtexSubTemplate = async ({ vtex, $document, tag }) => {
  const subTemplates = vtex.paths.find((item) => item.type === 'subtemplates');

  let subtemplateHtml = '';
  if (tag?.attrs?.id) {
    const fileUrl = resolve(subTemplates.folder, `${tag.attrs.id}.html`);
    subtemplateHtml = (await loadHtmlFromFileURL(fileUrl)) || `<!-- Subtemplate não encontrado: ${fileUrl} -->`;
  }

  return replaceContent($document, tag, subtemplateHtml);
};

const renderControllerObj = async ({ vtex, obj }) => {
  if (!obj) {
    return '';
  }

  let template;

  switch (obj.type) {
    case 'html':
      return obj?.props?.html || '';
    case 'banner':
      template = Handlebars.compile(
        `<div class="box-banner"><a href="{{url}}"><img id="i{{image}}" width="{{width}}" height="{{height}}" alt="{{name}}" src="{{image}}" complete="complete" /></a></div>`,
      );
      return template(obj?.props);
    case 'shelf':
      template = Handlebars.compile(
        `<div class="{{className}} n{{cols}}colunas"><h2>{{name}}</h2><ul>{{{shelfItems}}}</ul></div>`,
      );
      const shelfTemplateDirectory = vtex.paths.find((item) => item.type === 'shelves');
      if (shelfTemplateDirectory?.folder) {
        const files = await glob(`${shelfTemplateDirectory?.folder}/*.html`);

        const shelfTemplateFile = files.find((item) => {
          return path.parse(item).name === obj.shelfTemplateName;
        });

        if (shelfTemplateFile) {
          const templateDataUri = resolve(shelfTemplateDirectory?.folder, `${obj.shelfTemplateName}.data.js`);
          const templateData = (await checkFileExists(templateDataUri)) ? require(templateDataUri) : [];
          const shelfTemplateContent = renderShelf({
            vtex,
            html: await loadHtmlFromFileURL(resolve(shelfTemplateDirectory?.folder, `${obj.shelfTemplateName}.html`)),
            obj: Array.isArray(templateData)
              ? templateData[Math.floor(Math.random() * templateData.length)]
              : templateData,
          });

          // TODO: fazer o agrupamento de tags com base no número de colunes e itens
          const shelfItems = new Array(obj?.props?.items)
            .fill()
            .map((index) => {
              // TODO: mapear onde vamos salvar o ID da prateleira
              return `<li layout="ID" class="categoriaX|categoriaY">${shelfTemplateContent}</li>`;
            })
            .join('');

          return template({
            ...obj?.props,
            shelfItems,
          });
        }
      }

      return template(obj?.props);
    default:
      return '<!-- Objeto não reconhecido -->';
  }
};

const renderShelf = ({ vtex, html, obj }) => {
  const Engine = require('velocityjs');
  const keysToKebabCaseFormat = {
    BrandName: 'Brand',
  };
  const keysToMoneyFormat = [
    'ListPrice',
    'BestPrice',
    'InstallmentValue',
    'MaxInstallmentValue',
    'ListPriceMinusBestPrice',
    'BestPricePlusTax',
  ];

  const formatToMoney = (product) => {
    keysToMoneyFormat.forEach((key) => {
      if (product[key]) {
        product[key] = toMoney(product[key], vtex.CultureCode, vtex.ISOCurrencySymbol);
      }
    });
    return product;
  };

  const formatKebabCase = (product) => {
    Object.keys(keysToKebabCaseFormat).forEach((key) => {
      if (product[key]) {
        product[keysToKebabCaseFormat[key]] = kebabCase(product[key]);
      }
    });
    return product;
  };
  const product = formatToMoney(formatKebabCase(obj?.product));
  return Engine.render(html, {
    ...obj,
    product,
  });
};

/**
 * Com base nos atributos de uma tag de controller, realizar a substituição do conteúdo com base na configuração da tag
 *
 * @param {cheerio Object} $document
 */
const getController = async ({ vtex, $document, tag }) => {
  const customElements = vtex.paths.find((item) => item.type === 'customElements');
  const { tagname } = tag?.attrs;
  let html = '';

  const customElementHtml = resolve(customElements.folder, `${tagname}.html`);
  const customElementJson = resolve(customElements.folder, `${tagname}.json`);
  const customElementFolder = resolve(customElements.folder, `${tagname}`);

  try {
    // se arquivo existir, aplicar ele diretamente
    if (await checkFileExists(customElementHtml)) {
      html = await loadHtmlFromFileURL(customElementHtml);
    }
    // se o arquivo json existir, então obter ele e os complementares para aplicar
    else if (await checkFileExists(customElementJson)) {
      const obj = await loadHtmlFromFileURL(customElementJson);
      html = renderControllerObj({ obj, vtex });
    }
    // se a pasta existir, ler os arquivos .html da pasta e incluir eles diretamente
    else if (await checkFileExists(customElementFolder)) {
      const files = await glob(`${customElementFolder}/*.{json,html}`);
      if (files?.length) {
        for (const file of files) {
          if (/\.json$/.test(file)) {
            const obj = require(file);
            html += await renderControllerObj({ obj, vtex });
          } else {
            html += (await loadHtmlFromFileURL(file)) || '';
          }
        }
      }
    }
    // verifica em controles padrões da plataforma
    else if (ListVtexControllers.includes(tagname)) {
      const vtexController = VtexCmsMockedControllers.getController(tagname);
      html = vtexController?.render ? vtexController.render({ vtex, $document, tag }) : vtexController.rendered;
    } else {
      html = `<!-- controle não encontrado: ${tagname} -->`;
    }
  } catch (err) {
    console.log(err);
    return $document;
  }

  return replaceContent($document, tag, html);
};

/**
 * Reponsável por encontrar conteúdo customizado de um palceholder e substituir dentro de um conteúdo document
 */
const getVtexContentPlaceHolder = async ({ vtex, fileUrl, folderUrl, file_name, $document, tag }) => {
  let html = '';
  const placeHolderId = tag.attrs.id;

  const placeholderFileHtml = resolve(folderUrl, 'contentPlaceHolder', `${placeHolderId}.html`);
  const placeholderFileJson = resolve(folderUrl, 'contentPlaceHolder', `${placeHolderId}.json`);
  const placeholderFolder = resolve(folderUrl, 'contentPlaceHolder', `${placeHolderId}`);

  // se arquivo existir, aplicar ele diretamente
  if (await checkFileExists(placeholderFileHtml)) {
    html = await loadHtmlFromFileURL(placeholderFileHtml);
  }
  // se o arquivo json existir, então obter ele e os complementares para aplicar
  else if (await checkFileExists(placeholderFileJson)) {
    const obj = await loadHtmlFromFileURL(placeholderFileJson);
    html = renderControllerObj({ obj, vtex });
  }
  // se a pasta existir, ler os arquivos .html da pasta e incluir eles diretamente
  else if (await checkFileExists(placeholderFolder)) {
    const files = await glob(`${placeholderFolder}/*.{json,html}`);
    if (files?.length) {
      for (const file of files) {
        if (/\.json$/.test(file)) {
          const obj = require(file);
          html += await renderControllerObj({ obj, vtex });
        } else {
          html += (await loadHtmlFromFileURL(file)) || '';
        }
      }
    }
  } else {
    html = `<!-- placeholder não encontrado: ${tag.attrs.id} -->`;
  }

  return replaceContent($document, tag, html);
};

module.exports = {
  fixValidTags,
  getVtexSubTemplate,
  getController,
  getVtexContentPlaceHolder,
  renderControllerObj,
};
