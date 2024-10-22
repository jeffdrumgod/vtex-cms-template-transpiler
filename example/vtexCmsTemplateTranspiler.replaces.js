const { name, vtex } = require('./package.json');

/**
 * Este arquivo auxilia em substituição de conteúdo no momento de render
 * no navegador para auxiliar no ambiente de desenvolvimento.
 *
 * Toda função deve retornar o conteúdo HTML que será passado para a função posterior
 */
module.exports = {
  // antes de realizar qualquer manipulação do conteúdo
  startTemplateParser: null,
  // antes de realizar cada substituição de conteúdo do HTML (loop de troca de conteúdo)
  beforeEachRecursiveReplaceTags: ({ html }) => {
    return html.replace('inlinecss', 'inlinecss-development');
  },
  // quanto terminar todas as manipulações de conteúdo
  endTemplateParser: function ({ html }) {
    const reg = new RegExp(`https://${vtex.store}.vteximg.com.br/arquivos/`, 'g');
    const reg2 = new RegExp(`https://seu-domain-com-arquivos-estaticos.com.br/arquivos/`, 'g');
    return html.replace(reg, '/arquivos/').replace(reg2, '/arquivos/');
  },
  onRemoteResponse: function ({ html }) {
    const reg = new RegExp(`https://${vtex.store}.vteximg.com.br/arquivos/`, 'g');
    const reg2 = new RegExp(`https://seu-domain-com-arquivos-estaticos.com.br/arquivos/`, 'g');
    return html.replace(reg, '/arquivos/').replace(reg2, '/arquivos/');
  },
};
