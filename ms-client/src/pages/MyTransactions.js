import React, { useCallback, useState, useEffect } from 'react'
import { TransactionList } from '../components/TransactionList'
import { useHttp } from '../hooks/http.hook'

export const MyTransactions = () => {
  const [transaction, setTransaction] = useState([])
  const { request } = useHttp()

  const fetchTransactions = useCallback(async () => {
      const fetched = await request('/blockchain/findAll', 'POST', null)
      setTransaction(fetched)
  })

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <>
    { <TransactionList transaction={ transaction } />}
    </>
  )
}