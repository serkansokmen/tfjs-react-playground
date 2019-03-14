import React from 'react'
import Nav from '../components/nav'

export default ({ children }) => (
  <div>
    <Nav />
    { children }
  </div>
)