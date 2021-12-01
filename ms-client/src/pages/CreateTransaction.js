import React, { useState, useEffect } from 'react'

export const CreateTransaction = () => {

  const [inputList, setInputList] = useState([{ address: "", value: "" }]);

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

  return (
    <div>
      <form class="col s12">
        <div class="input-field col s12">
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
          <div class="container">
            <div class="row">
              
                  <div class="input-field col s6">
                    <i class="material-icons prefix">account_balance_wallet</i>
                    <input name="address" id="icon_prefix" type="text" class="validate" value={x.address} onChange={e => handleInputChange(e, i)}/>
                    <label for="icon_prefix">Address</label>
                  </div>
                  <div class="input-field col s6">
                    <i class="material-icons prefix">attach_money</i>
                    <input name="value" id="icon_telephone" type="text" class="validate" value={x.value} onChange={e => handleInputChange(e, i)}/>
                    <label for="icon_telephone">value</label>
                  </div>
                  <div className="btn-box">
                    {inputList.length !== 1 && <button
                      class="btn-floating btn-large waves-effect waves-light purple lighten-3"
                      onClick={() => handleRemoveClick(i)}><i 
                      class="material-icons">remove</i></button>}
                    {inputList.length - 1 === i && <button 
                      class="btn-floating btn-large waves-effect waves-light purple lighten-3" 
                      onClick={handleAddClick}><i 
                      class="material-icons">add</i></button>}
                  </div>
              
            </div>
          </div> 
        )
      })}
      <button class="btn waves-effect waves-light deep-purple lighten-1" type="submit" name="action">Send
      <i class="material-icons right">send</i>
      </button>
      </form>
      
    </div>
  );
}
