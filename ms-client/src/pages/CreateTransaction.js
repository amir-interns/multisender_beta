import React, { useState, useEffect, useCallback } from 'react'
import { useHttp } from '../hooks/http.hook';

export const CreateTransaction = () => {

  const [inputList, setInputList] = useState([{ address: "", value: "" }]);
  const {request} = useHttp()
  // handle input change
  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...inputList];
    list[index][name] = value;
    setInputList(list);
  };

  // handle click event of the Remove button
  const handleRemoveClick = index => {
    const list = [...inputList];
    list.splice(index, 1);
    setInputList(list);
  };

  // handle click event of the Add button
  const handleAddClick = () => {
    setInputList([...inputList, { address: "", value: "" }]);
  };

  document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = window.M.FormSelect.init(elems);
  });

  useEffect(() => {
    window.M.updateTextFields()
  }, [])

  const handleOnSubmit = async () => {
    const fetched = await request('/blockchain/console', 'POST', {inputList})
  }

  return (
    <div>
      <form className="col s12" onSubmit={() => handleOnSubmit()}>
        <div className="input-field col s12">
          <select>
            <option value="" disabled selected>Выберите валюту</option>
            <option value="btc">Bitcoin</option>
            <option value="eth">Ethereum</option>
            <option value="usdt">ERC-20</option>
            <option value="trc20">TRC-20</option>
            <option value="trx">Tron</option>
          </select>
          <label>Выбранная валюта</label>
        </div>
      {inputList.map((x, i) => {
        return (
          <div className="container">
            <div className="row">
              
                  <div className="input-field col s6">
                    <i className="material-icons prefix">account_balance_wallet</i>
                    <input name="address" id="icon_prefix" type="text" className="validate" value={x.address} onChange={e => handleInputChange(e, i)}/>
                    <label htmlFor="icon_prefix">Address</label>
                  </div>
                  <div className="input-field col s6">
                    <i className="material-icons prefix">attach_money</i>
                    <input name="value" id="icon_telephone" type="text" className="validate" value={x.value} onChange={e => handleInputChange(e, i)}/>
                    <label htmlFor="icon_telephone">value</label>
                  </div>
                  <div className="btn-box">
                    {inputList.length !== 1 && <button
                      className="btn-floating btn-large waves-effect waves-light purple lighten-3"
                      onClick={() => handleRemoveClick(i)}><i 
                      className="material-icons">remove</i></button>}
                    {inputList.length - 1 === i && <button 
                      className="btn-floating btn-large waves-effect waves-light purple lighten-3" 
                      onClick={handleAddClick}><i 
                      className="material-icons">add</i></button>}
                  </div>
              
            </div>
          </div> 
        )
      })}
      <button className="btn waves-effect waves-light deep-purple lighten-1" type="submit" name="action">Send
      <i className="material-icons right">send</i>
      </button>
      </form>
      
    </div>
  );
}
