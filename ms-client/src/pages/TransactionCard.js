import React, { useCallback, useState, useEffect } from 'react'
import { PrintTransaction } from '../components/PrintTransaction'
import { useHttp } from '../hooks/http.hook'
import {useParams} from 'react-router-dom'

export const TransactionCard = () => {
  const [transaction, setTransaction] = useState([])
  const { request } = useHttp()
  const linkId = useParams().id

  const fetchTransactions = useCallback(async () => {
      const fetched = await request(`/request/findOne/${linkId}`, 'POST', null)
      setTransaction(fetched)
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  return (
    
    <>
    { <PrintTransaction transaction={ transaction } />}
    </>
  )
}