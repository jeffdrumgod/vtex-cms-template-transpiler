// https://help.vtex.com/pt/tutorial/controles-do-template-de-prateleira--tutorials_550
module.exports = [
  {
    id: '19ccd66b-b568-43cb-a106-b52f9796f5cd',
    product: {
      id: '1',
      Uri: '#',
      Name: 'Product 1',
      HtmlEscapedName: 'Product 1',
      productVariantId: '001',
      DescriptionShort: 'lorem ipsum',
      IsInStock: true,
      HasBestPrice: true,
      ListPrice: 110,
      BestPrice: 90,
      NumbersOfInstallment: 3,
      MaxNumbersOfInstallment: 3,
      InstallmentValue: 10,
      MaxInstallmentValue: 10,
      ListPriceMinusBestPrice: 10,
      ListPriceMinusBestPriceInPercent: 10,
      BestPricePlusTax: 10,
      DepartmentName: 'Departament Name',
      DepartmentLink: '#',
      CategoryName: 'Category Name',
      CategoryLink: '#',
      BrandName: 'Marca Produto',
      BrandLink: '#',
      HightLight: '<p class="flag lancamento">Lançamento</p>',
      DiscountHightLight: '<p class="flag promo">Promo</p>',
      BottomBuyAllSku: '',
      BottomBuy: '',
      AmountInCart: '',
      EvaluationRate: '',
      Tax: '',
      QuickView: '',
      Compare: '',
      BestRewardValue: '',
      PercentBougthAndBought: '',
      PercentBoughtAlso: '',
      PercentViewedAlso: '',
      InsertSku: '',
      ButtonBuyModal: () => {
        return '';
      },
      GetImageTag: (size, label) => {
        return '<img src="http://placehold.it/100x100" alt="Product 1" />';
      },
      ProductField: (id) => {
        return '';
        // switch (id) {
        //   case '':
        //     return '.';
        //   default:
        //     return '';
        // }
      },
    },
  },
];
