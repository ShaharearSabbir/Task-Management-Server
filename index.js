const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");

const app = express();
const port = 3000;

const readTasks = (callback) => {
  fs.readJson("./Tasks.json", (err, data) => {
    if (err) {
      console.error(err);
      callback(err, null);
      return;
    }
    callback(null, data);
  });
};

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Api is running");
});

app.get("/pendingTasks", (req, res) => {
  readTasks((err, obj) => {
    if (err) {
      return res.status(500).send("Error reading tasks");
    }
    const tasks = obj?.tasks || [];
    const pendingTasks = tasks.filter((task) => !task.completed);
    res.send(pendingTasks);
  });
});


app.get("/completedTasks", (req, res) => {
  readTasks((err, obj) => {
    if (err) {
      return res.status(500).send("Error reading tasks");
    }
    const tasks = obj?.tasks || [];
    const completedTasks = tasks.filter((task) => task.completed);
    res.send(
      completedTasks.length > 0 ? completedTasks.length : "No completed tasks"
    );
  });
});

app.post("/addTasks", (req, res) => {
  readTasks((err, obj) => {
    if (err) {
      return res.status(500).send("Error reading tasks");
    }
    const tasks = obj?.tasks || [];
    const newTask = req.body;
    newTask.id = tasks.length + 1;
    newTask.completed = false;
    tasks.push(newTask);

    fs.writeJson("./Tasks.json", { tasks }, (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
        return res.status(500).send("Error saving task");
      }
      res.status(201).json(newTask);
    });
  });
});

app.put("/updateTasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    const updatedTask = req.body;
    readTasks((err, obj) => {
      if (err) {
        return res.status(500).send("Error reading tasks");
      }
      const tasks = obj?.tasks || [];
      const taskIndex = tasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) {
        return res.status(404).send("Task not found");
      }
      tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };

      fs.writeJson("./Tasks.json", { tasks }, (writeErr) => {
        if (writeErr) {
          console.error(writeErr);
          return res.status(500).send("Error saving task");
        }
        res.json(tasks[taskIndex]);
      });
    });
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
