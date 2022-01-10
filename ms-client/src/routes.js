import React from 'react'
import {Routes, Route} from 'react-router-dom'
import {CreateTransaction} from './pages/CreateTransaction'
import {MyTransactions} from './pages/MyTransactions'
import { TransactionCard } from './pages/TransactionCard'
import { Welcome } from './pages/Welcome'

export const useRoutes = () => {
    return (
      <Routes>
        <Route exact path="/makeTx" element={<CreateTransaction/>}/>
        <Route exact path="/listTx" element={<MyTransactions/>}/>
        <Route exact path="/payCard/:id" element={<TransactionCard/>}/>
        <Route exact path="/" element={<Welcome/>}/>
      </Routes>
    )
  
}