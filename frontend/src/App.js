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
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        TodoListContractabi.abi,
        signer
      );
      TodoContract.addToDoItem(value);
    }
  };

  const removeItem = async (id) => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const TodoContract = new ethers.Contract(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        TodoListContractabi.abi,
        signer
      );
      TodoContract.removeItem(id);
    }
  };

  const fetchContract = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const TodoContract = new ethers.Contract(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
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
      console.log("okee");
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const TodoContract = new ethers.Contract(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        TodoListContractabi.abi,
        signer
      );

      const todocount = await TodoContract.taskCounter();
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

  contract &&
    contract.on("TodoItemRemoved", (id) => {
      const updatedList = todoItems.filter((item, index) => {
        if (item.id.toNumber() !== id.toNumber()) {
          return true;
        }
      });

      setTodoItems(updatedList);
    });

  return (
    <div className="App">
      <h1>My first blockchain Todolist</h1>
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
                <button
                  onClick={(e) => {
                    removeItem(item.id.toNumber());
                  }}
                >
                  remove
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default App;
