import React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import {Navbar} from './components/Navbar'
import { useRoutes } from './routes'
import 'materialize-css'
import background from "./images/background.jpg"
import './index.css';
import {Footer} from './components/Footer'

function App() {
  const routes = useRoutes()
  return (
      <Router>
        { <Navbar /> }
        <div class="parallax-container" style={{height: "200px"}}>
          <div class="parallax"><img src={background}/></div>
        </div>

        <div class="section white">
          <div class="row container">
            { routes }
          </div>
        </div>

        <div class="parallax-container" style={{height: "300px"}}>
          <div class="parallax"><img src={background}/></div>
        </div>
        {<Footer/>}
      </Router>
  )
}

export default App;
