describe('Pages', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Should have correct links', () => {
    cy.contains('a', 'Home')
    cy.contains('a', 'Intro')
    cy.contains('a', 'XOR')
    cy.contains('a', 'LSTM')
    cy.contains('a', 'Posenet')
    cy.contains('a', 'Coco SSD')
    cy.contains('a', 'Linear Regression')
    cy.contains('a', 'Bakarlar')
  })
})
