describe('Pages', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('Home page should have correct links.', () => {
    cy.contains('a', 'Home')
    cy.contains('a', 'Intro')
    // cy.contains('a', 'XOR')
    // cy.contains('a', 'LSTM')
    cy.contains('a', 'Posenet')
    cy.contains('a', 'Coco SSD')
    cy.contains('a', 'Linear Regression')
    // cy.contains('a', 'Bakarlar')
  })

  it('Intro page should train on function f(x) = x⁶+2x⁴+3x²+x+1.', () => {
    cy.contains('a', 'Intro').first().click()
    cy.wait(6000)
    cy.contains('f(x) = x⁶+2x⁴+3x²+x+1.')
    cy.get('input[name="epochs"]').clear().type(100)
    cy.get('input[name="learningRate"]').clear().type(0.95)
    cy.contains('button[type="submit"]', 'Train').as('submit')
    cy.get('@submit').click()
    cy.contains('Tensor -0.18038426339626312')

    cy.get('input[name="epochs"]').clear().type(50)
    cy.get('input[name="learningRate"]').clear().type(0.9)
    cy.get('@submit').click()
    cy.contains('Tensor -0.31614893674850464')
  })

  it('Has a working Posenet page', () => {
    cy.contains('a', 'Posenet').first().click()
    cy.contains('div', 'enabled').siblings('div').first().find('svg').click()
    cy.contains('div', 'use webcam').first().click()
    cy.contains('span', 'Close Controls').click()
    cy.contains('span', 'Open Controls').click()
    cy.contains('div', 'enabled').siblings('div').first().find('svg').click()
  })

  it('Has a working Linear Regression page', () => {
    cy.contains('a', 'Linear Regression').first().click()
    cy.wait(5000)

    // cy.get('input[name="epochs"]').clear().type(100)
    // cy.get('input[name="batchSize"]').clear().type(58)
    // cy.contains('button[type="submit"]', 'Train').as('submit')

    cy.contains('button[type="button"]', 'Test').as('testBtn')
    cy.get('@testBtn').click()
    cy.contains('Horsepower v MPG')
    cy.contains('Model Summary')
    cy.wait(1500)
    cy.contains('Model Predictions vs Original Data')
  })

  it('Has a working CocoSSD page', () => {
    cy.contains('a', 'Coco SSD').first().click()
    cy.contains('div', 'Loading...')
  })
})
