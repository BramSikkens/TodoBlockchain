//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract TodoList {
    struct Task {
        uint256 id;
        string content;
        bool completed;
    }

    event TodoAdded(uint256 id, string content, bool completed);
    event TodoToggled(uint256 id, bool completed);
    event TodoItemRemoved(uint256 id);

    mapping(uint256 => Task) public tasks;
    uint256 public taskCounter = 0;

    constructor() {
        console.log("Deploying a TodoList");
    }

    function addToDoItem(string memory _content) public {
        tasks[taskCounter] = Task(taskCounter, _content, false);
        emit TodoAdded(taskCounter, _content, false);
        taskCounter++;
    }

    function returnToItem(uint256 id) external view returns (Task memory) {
        return tasks[id];
    }

    function toggleItem(uint256 _id) public {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit TodoToggled(_id, _task.completed);
    }

    function removeItem(uint256 _id) public {
        delete tasks[_id];
        emit TodoItemRemoved(_id);
    }
}
