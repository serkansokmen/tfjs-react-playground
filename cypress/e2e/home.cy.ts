describe('Pages', () => {
  before(() => {
    cy.visit('/')
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('Home page should have correct links.', () => {
    cy.contains('a', 'Home')
    cy.contains('a', 'XOR')
    cy.contains('a', 'LR')
    cy.contains('a', 'CNN')
    cy.contains('a', 'Posenet')
    cy.contains('a', 'Body Pix')
    cy.contains('a', 'Coco SSD')
  })

  it('Intro page should train on function f(x) = x⁶+2x⁴+3x²+x+1.', () => {
    // cy.contains('a', 'Intro').first().click()
    cy.visit('/')
    cy.contains('f(x) = x⁶+2x⁴+3x²+x+1')

    cy.get('input[name="epochs"]').clear({ force: true }).type('100')
    cy.get('input[name="learningRate"]').clear({ force: true }).type('0.95')
    cy.contains('button[type="submit"]', 'Train').as('submit')
    cy.get('@submit').click()
    cy.contains('Tensor ')

    cy.get('input[name="epochs"]').clear({ force: true }).type('50')
    cy.get('input[name="learningRate"]').clear({ force: true }).type('0.9')
    cy.get('@submit').click()

    cy.contains('Tensor ')
  })

  // it('Has a working Posenet page', () => {
  //   cy.contains('a', 'Posenet').first().click()
  //   cy.visit('/tf-posenet')
  //   cy.contains('div', 'enabled').siblings('div').first().find('svg').click()
  //   cy.contains('div', 'use webcam').first().click()
  //   cy.contains('span', 'Close Controls').click()
  //   cy.contains('span', 'Open Controls').click()
  //   cy.contains('div', 'enabled').siblings('div').first().find('svg').click()
  // })

  it('Has a working Linear Regression page', () => {
    // cy.contains('a', 'LR').first().click()
    cy.visit('/tf-linear-regression')

    cy.get('input[name="epochs"]').clear({ force: true }).type('100')
    cy.get('input[name="batchSize"]').clear({ force: true }).type('58')
    cy.contains('button[type="submit"]', 'Train').as('submit')

    cy.contains('button[type="button"]', 'Test').as('testBtn')
    cy.get('@testBtn').click()
    cy.contains('Horsepower v MPG')
    cy.contains('Model Summary')

    cy.contains('Model Predictions vs Original Data')
  })

  // it('Has a working CocoSSD page', () => {
  //   cy.contains('a', 'Coco SSD').first().click()
  //   cy.contains('div', 'Loading...')
  // })
})
