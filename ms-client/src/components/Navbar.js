import React from 'react'
import {NavLink} from 'react-router-dom'


export const Navbar = () => {
  return (
    <nav>
      <div className="nav-wrapper purple darken-3" style={{ padding: '0 2rem' }}>
        <span className="brand-logo">MULTISENDER-beta</span>
        <ul id="nav-mobile" className="right hide-on-med-and-down">
          <li><NavLink to="/makeTx">Создать транзакцию</NavLink></li>
          <li><NavLink to="/listTx">Мои транзакции</NavLink></li>
          <li><a href="/" >Выйти</a></li>
        </ul>
      </div>
    </nav>
  )
}