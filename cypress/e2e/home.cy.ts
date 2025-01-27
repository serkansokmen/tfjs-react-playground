const links = ['Intro', 'XOR', 'LR', 'CNN', 'Posenet', 'Body Pix', 'Coco SSD']
const hrefs: {
  [key: string]: string
} = {
  Intro: '/tf-intro',
  XOR: '/tf-xor',
  LR: '/tf-linear-regression',
  CNN: '/tf-cnn',
  Posenet: '/tf-posenet',
  'Body Pix': '/tf-body-pix',
  'Coco SSD': '/tf-coco-ssd',
}

describe('Pages', () => {
  describe('Desktop Navigation', () => {
    beforeEach(() => {
      cy.viewport('macbook-15')
      cy.visit('/tf-intro')
    })

    it('should have proper navigation links', () => {
      const links = Object.keys(hrefs)
      links.forEach((link) => {
        cy.contains('a', link)
      })
    })
  })

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
      cy.visit('/tf-intro')
    })

    it('should open and close the mobile menu', () => {
      cy.get("[data-cy='menu-toggle']").click()
      cy.get('nav').should('be.visible')
      cy.get("[data-cy='menu-toggle']").click()
      cy.get('nav').should('not.be.visible')
    })

    it('should have proper navigation links', () => {
      cy.get("[data-cy='menu-toggle']").click()
      const links = Object.keys(hrefs)
      links.forEach((link) => {
        cy.contains('a', link)
      })
    })
  })

  // TODO: Fix these tests with proper demos
  describe.skip('Common', () => {
    it('Intro page should train on function f(x) = x⁶+2x⁴+3x²+x+1.', () => {
      cy.visit(hrefs.Intro)
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

    it('Has a working Posenet page', () => {
      cy.visit(hrefs.Posenet)
      cy.contains('div', 'enabled').siblings('div').first().find('svg').click()
      cy.contains('div', 'use webcam').first().click()
      cy.contains('span', 'Close Controls').click()
      cy.contains('span', 'Open Controls').click()
      cy.contains('div', 'enabled').siblings('div').first().find('svg').click()
    })

    it('Has a working Linear Regression page', () => {
      cy.visit(hrefs.LR)

      cy.get('input[name="epochs"]').clear({ force: true }).type('100')
      cy.get('input[name="batchSize"]').clear({ force: true }).type('58')
      cy.contains('button[type="submit"]', 'Train').as('submit')

      cy.contains('button[type="button"]', 'Test').as('testBtn')
      cy.get('@testBtn').click()
      cy.contains('Horsepower v MPG')
      cy.contains('Model Summary')

      cy.contains('Model Predictions vs Original Data')
    })
  })
})
