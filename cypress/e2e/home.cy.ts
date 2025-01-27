const links = ['Intro', 'XOR', 'LR', 'CNN', 'Posenet', 'Body Pix', 'Coco SSD']
const hrefs: {
  [key: string]: string
} = {
  '/tf-intro': 'Intro',
  '/tf-xor': 'XOR',
  '/tf-linear-regression': 'LR',
  '/tf-cnn': 'CNN',
  '/tf-posenet': 'Posenet',
  '/tf-body-pix': 'Body Pix',
  '/tf-coco-ssd': 'Coco SSD',
}

describe('Pages', () => {
  describe('Desktop Navigation', () => {
    beforeEach(() => {
      cy.viewport('macbook-15')
      cy.visit('/tf-intro')
    })

    it('should have proper navigation links', () => {
      const links = Object.values(hrefs)
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
      const links = Object.values(hrefs)
      links.forEach((link) => {
        cy.contains('a', link)
      })
    })
  })

  describe('Training', () => {
    it('Intro page should train on function f(x) = x⁶+2x⁴+3x²+x+1.', () => {
      cy.visit('/tf-intro')
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
      cy.visit('/tf-posenet')
      cy.contains('h3', 'Model Selection')
    })

    // it('Has a working Linear Regression page', () => {
    //   cy.visit('/tf-linear-regression')
    //   cy.wait(1000)
    //   cy.get('input[name="epochs"]').clear({ force: true }).type('100')
    //   cy.get('input[name="batchSize"]').clear({ force: true }).type('58')
    //   cy.contains('button[type="submit"]', 'Train').as('submit')

    //   cy.contains('button[type="button"]', 'Test').as('testBtn')
    //   cy.get('@testBtn').click()
    //   cy.contains('Horsepower v MPG')
    //   cy.contains('Model Summary')

    //   cy.contains('Model Predictions vs Original Data')
    // })
  })
})
