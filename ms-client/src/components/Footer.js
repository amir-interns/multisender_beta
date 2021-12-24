import React from "react"
import {NavLink} from 'react-router-dom'

export const Footer = () => {

    return (
        <footer class="page-footer purple darken-3">
        <div class="container">
          <div class="row">
            <div class="col l6 s12">
              <h5 class="white-text">Multisender App</h5>
              <p class="grey-text text-lighten-4">This is development version.</p>
            </div>
                <div class="col l4 offset-l2 s12">
                    <h5 class="white-text">Links</h5>
                    <ul>
                    <li><NavLink to="/api/docs">Help</NavLink></li>
                    </ul>
                </div>
          </div>
        </div>
        <div class="footer-copyright">
          <div class="container">
          © 2021 Copyright Text
          </div>
        </div>
      </footer>
    )
}