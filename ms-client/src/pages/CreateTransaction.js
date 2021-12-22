import React, { useState, useEffect } from 'react'
import { useHttp } from '../hooks/http.hook';
import { useMessage } from '../hooks/message.hook';

export const CreateTransaction = () => {
  const [value, setValue] = useState();
  const [selectValue, setSelectValue] = useState();
  const { request, error, clearError } = useHttp()
  const message = useMessage()

  const handleOnSubmit = async (event) => {
    try {
    const type = selectValue
    const data = value
    if (!(data && type))
      throw new Error("Неверные данные")
    const addresses = data.match(/\w{32,}\b/ug)
    const values = data.match(/\b[\d.]{1,}\b/ug)
    let tmp = { to: "", value: "" }
    let send = []
    for (let i = 0; i < addresses.length; i++) {
      tmp.to = addresses[i]
      tmp.value = values[i]
      send.push(tmp)
    }
    
    const fetched = await request('/blockchain/sendTx', 'POST', {send, type})
    message(fetched.message)
    console.log('hello')
    } catch(e) {
      window.M.toast({html: e})
    }  
  }

  useEffect(() => {
    message(error)
    clearError()
  }, [error, message, clearError])

  useEffect(() => {
    window.M.AutoInit();
  }, [])

  const handleOnChange = (event) => {
    setValue(event.target.value)
  }

  const handleOnSelectChange = (event) => {
    setSelectValue(event.target.value)
  }

  return (
    <div>
      <div className="col s12">
        <div className="input-field col s12">
          <select name="select" onChange={event => handleOnSelectChange(event)}>
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
      <button className="btn waves-effect waves-light deep-purple lighten-1" onClick={(event) => handleOnSubmit(event)} >Send
      <i className="material-icons right">send</i>
      </button>
      </div>
      
    </div>
  );
}
