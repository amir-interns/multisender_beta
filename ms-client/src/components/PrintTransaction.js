import React from 'react'

export const PrintTransaction = ({ transaction }) => {
  //if (!(transaction.length != null)) {
  //  return <p className="center">Not Found</p>
  //}

  return (
    <>
    <div class="card horizontal">
      <div class="card-content">
        <h3>Транзакция №{transaction.id}</h3>
        <p>Статус: <a target="_blank" rel="noopener noreferrer">{transaction.status}</a></p>
        <p>К оплате: <a target="_blank" rel="noopener noreferrer">{transaction.finalSum}</a></p>
        <p>Оплатить по адресу: <a target="_blank" rel="noopener noreferrer">{transaction.address}</a></p>
      </div>
    </div>
    
  </>
  )
}