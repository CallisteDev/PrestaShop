require('module-alias/register');

const {expect} = require('chai');

// Import utils
const helper = require('@utils/helpers');
const loginCommon = require('@commonTests/loginBO');

// Import pages
const LoginPage = require('@pages/BO/login');
const DashboardPage = require('@pages/BO/dashboard');
const ProductsPage = require('@pages/BO/catalog/products/index');

// Import test context
const testContext = require('@utils/testContext');

const baseContext = 'functional_BO_catalog_products_sortProducts';

let browserContext;
let page;
let numberOfProducts = 0;

// Init objects needed
const init = async function () {
  return {
    loginPage: new LoginPage(page),
    dashboardPage: new DashboardPage(page),
    productsPage: new ProductsPage(page),
  };
};

describe('Sort products', async () => {
  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);

    this.pageObjects = await init();
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  // Login into BO and go to products page
  loginCommon.loginBO();

  it('should go to products page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToProductsPage', baseContext);

    await this.pageObjects.dashboardPage.goToSubMenu(
      this.pageObjects.dashboardPage.catalogParentLink,
      this.pageObjects.dashboardPage.productsLink,
    );

    await this.pageObjects.productsPage.closeSfToolBar();

    const pageTitle = await this.pageObjects.productsPage.getPageTitle();
    await expect(pageTitle).to.contains(this.pageObjects.productsPage.pageTitle);
  });

  it('should reset all filters and get number of products', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetFirst', baseContext);

    numberOfProducts = await this.pageObjects.productsPage.resetAndGetNumberOfLines();
    await expect(numberOfProducts).to.be.above(0);
  });
  const tests = [
    {
      args:
        {
          testIdentifier: 'sortByIdAsc', sortBy: 'id_product', sortDirection: 'asc', isFloat: true,
        },
    },
    {
      args:
        {
          testIdentifier: 'sortByNameAsc', sortBy: 'name', sortDirection: 'asc', isFloat: false,
        },
    },
    {
      args:
        {
          testIdentifier: 'sortByNameDesc', sortBy: 'name', sortDirection: 'desc', isFloat: false,
        },
    },
    {
      args:
        {
          testIdentifier: 'sortByReferenceAsc', sortBy: 'reference', sortDirection: 'asc', isFloat: false,
        },
    },
    {
      args:
        {
          testIdentifier: 'sortByReferenceDesc', sortBy: 'reference', sortDirection: 'desc', isFloat: false,
        },
    },
    {
      args:
        {
          testIdentifier: 'sortByCategoryAsc', sortBy: 'name_category', sortDirection: 'asc', isFloat: false,
        },
    },
    {
      args:
        {
          testIdentifier: 'sortByCategoryDesc', sortBy: 'name_category', sortDirection: 'desc', isFloat: false,
        },
    },
    {
      args:
        {
          testIdentifier: 'sortByPriceAsc', sortBy: 'price', sortDirection: 'asc', isFloat: true,
        },
    },
    {
      args:
        {
          testIdentifier: 'sortByPriceDesc', sortBy: 'price', sortDirection: 'desc', isFloat: true,
        },
    },
    {
      args:
        {
          testIdentifier: 'sortByQuantityAsc', sortBy: 'sav_quantity', sortDirection: 'asc', isFloat: true,
        },
    },
    {
      args:
        {
          testIdentifier: 'sortByQuantityDesc', sortBy: 'sav_quantity', sortDirection: 'desc', isFloat: true,
        },
    },
    {
      args:
        {
          testIdentifier: 'sortByIdDesc', sortBy: 'id_product', sortDirection: 'desc', isFloat: true,
        },
    },
  ];

  tests.forEach((test) => {
    it(`should sort by '${test.args.sortBy}' '${test.args.sortDirection}' And check result`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', test.args.testIdentifier, baseContext);

      let nonSortedTable = await this.pageObjects.productsPage.getAllRowsColumnContent(test.args.sortBy);

      await this.pageObjects.productsPage.sortTable(test.args.sortBy, test.args.sortDirection);

      let sortedTable = await this.pageObjects.productsPage.getAllRowsColumnContent(test.args.sortBy);

      if (test.args.isFloat) {
        nonSortedTable = await nonSortedTable.map(text => parseFloat(text));
        sortedTable = await sortedTable.map(text => parseFloat(text));
      }

      const expectedResult = await this.pageObjects.productsPage.sortArray(nonSortedTable, test.args.isFloat);

      if (test.args.sortDirection === 'asc') {
        await expect(sortedTable).to.deep.equal(expectedResult);
      } else {
        await expect(sortedTable).to.deep.equal(expectedResult.reverse());
      }
    });
  });
});
