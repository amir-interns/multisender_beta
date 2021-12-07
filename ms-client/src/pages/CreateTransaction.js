import React, { useState, useEffect } from 'react'
import { useHttp } from '../hooks/http.hook';

export const CreateTransaction = () => {
  const [value, setValue] = useState();
  const {request} = useHttp()

  const handleOnSubmit = async (event) => {
    const type = event.target.select.value
    const data = value
    const addresses = data.match(/\w{32,}\b/ug)
    const values = data.match(/\b[\d.]{1,}\b/ug)
    let tmp = { to: "", value: "" }
    let send = []
    for (let i = 0; i < addresses.length; i++) {
      tmp.to = addresses[i]
      tmp.value = values[i]
      send.push(tmp)
    }
    const fetched = await request('/blockchain/sendTx', 'POST', {type, send})
  }

  useEffect(() => {
    window.M.AutoInit();
  }, [])

  const handleOnChange = (event) => {
    setValue(event.target.value)
  }

  return (
    <div>
      <form className="col s12" onSubmit={(event) => handleOnSubmit(event)}>
        <div className="input-field col s12">
          <select name="select">
            <option value="" disabled selected>Выберите валюту</option>
            <option value="btc">Bitcoin</option>
            <option value="eth">Ethereum</option>
            <option value="usdt">ERC-20</option>
            <option value="trc20">TRC-20</option>
            <option value="trx">Tron</option>
          </select>
          <label>Выбранная валюта</label>
        </div>
        <div className="container">
          <form className="col s12">
            <div className="row">
              <div className="input-field col s12">
                <textarea id="textarea1" name="textarea" className="materialize-textarea" value={value} onChange={event => handleOnChange(event)}></textarea>
                <label htmlFor="textarea1">Введите запрос</label>
              </div>
            </div>
          </form>
        </div>
      <button className="btn waves-effect waves-light deep-purple lighten-1" type="submit" name="action">Send
      <i className="material-icons right">send</i>
      </button>
      </form>
      
    </div>
  );
}
