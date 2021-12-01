import React from 'react'
import {Routes, Route} from 'react-router-dom'
import {CreateTransaction} from './pages/CreateTransaction'
import {MyTransactions} from './pages/MyTransactions'

export const useRoutes = () => {
    return (
      <Routes>
        <Route exact path="/makeTx" element={<CreateTransaction/>}/>
        <Route exact path="/listTx" element={<MyTransactions/>}/>
      </Routes>
    )
  
}