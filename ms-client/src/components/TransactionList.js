import React from 'react'

export const TransactionList = ({ transaction }) => {
  if (!transaction.length) {
    return <p className="center">Транзакций пока нет</p>
  }

  return (
    <table>
      <thead>
      <tr>
        <th>Заявка №</th>
        <th>Сумма</th>
        <th>Необходимо оплатить по адресу</th>
      </tr>
      </thead>

      <tbody>
      { transaction.map((transaction, index) => {
        return (
          <tr key={transaction._id}>
            <td>{index + 1}</td>
            <td>{transaction.typeCoin}</td>
            <td>{transaction.txHash}</td>
          </tr>
        )
      }) }
      </tbody>
    </table>
  )
}