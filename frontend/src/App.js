import "./App.css";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import TodoListContractabi from "./contracts/TodoList.json";
import { ethers } from "ethers";

function App() {
  const [walletStatus, setWalletStatus] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [todoItems, setTodoItems] = useState(new Array());

  const checkWalletConnection = () => {
    const { ethereum } = window;
    if (ethereum) {
      console.log("Wallet available");
      return true;
    } else {
      console.log("No wallet available");
      return false;
    }
  };

  const fetchAccount = async () => {
    const { ethereum } = window;
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      return accounts[0];
    } catch (e) {
      alert(e.message);
    }
  };

  const addTodoItemtoContract = async (value) => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const TodoContract = new ethers.Contract(
        "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
        TodoListContractabi.abi,
        signer
      );
      TodoContract.addToDoItem(value);
    }
  };

  const fetchContract = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const TodoContract = new ethers.Contract(
        "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
        TodoListContractabi.abi,
        signer
      );

      return TodoContract;
    }
  };

  const fetchTodoItems = async () => {
    const todoItems = new Array();
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const TodoContract = new ethers.Contract(
        "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
        TodoListContractabi.abi,
        signer
      );

      const todocount = await TodoContract.tasks().length();
      console.log(todocount);

      for (let i = 0; i < todocount; i++) {
        let value = await TodoContract.tasks(i);
        todoItems.push({
          id: value.id,
          content: value.content,
          completed: value.completed,
        });
      }

      return todoItems;
    }
  };

  const toggleTodoItem = async (id) => {
    if (contract) {
      await contract.toggleItem(id);
    }
  };

  useEffect(() => {
    setWalletStatus(checkWalletConnection());
    fetchAccount().then((account) => setCurrentAccount(account));
    fetchContract().then((contract) => setContract(contract));
  }, []);

  useEffect(() => {
    fetchTodoItems().then((items) => {
      setTodoItems(items);
    });
    console.log(todoItems);
  }, [contract]);

  contract &&
    contract.on("TodoAdded", (id, content, completed) => {
      setTodoItems([
        ...todoItems,
        {
          id: id,
          content: content,
          completed: completed,
        },
      ]);
    });

  contract &&
    contract.on("TodoToggled", (id, completed) => {
      const updatedList = todoItems.map((item, index) => {
        if (item.id.toNumber() === id.toNumber()) {
          return { ...item, completed: completed };
        } else {
          return item;
        }
      });

      setTodoItems(updatedList);
    });

  return (
    <div className="App">
      <h1>LETS BUILD SOME SHIT!!!!</h1>
      <h2>WalletStatus:</h2>
      <p>{walletStatus}</p>
      <h2>Current Account:</h2> {currentAccount}
      <h2>TodoItems</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          addTodoItemtoContract(formData.get("task"));
        }}
      >
        <label for="task">New TodoItem:</label>
        <input type="text" name="task" />
        <input type="submit" value="submit" />
      </form>
      <ul>
        {todoItems &&
          todoItems.map((item, i) => {
            return (
              <li>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onClick={(e) => {
                    console.log("id:", item.id.toNumber());
                    console.log("toggle:", e.target.checked);
                    toggleTodoItem(item.id.toNumber());
                  }}
                />
                {item.content} : {i + 1}
                <button>remove</button>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default App;
