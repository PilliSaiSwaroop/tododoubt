const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "todoApplication.db");

app.use(express.json());
let db = null;

const initializeServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running.....");
    });
  } catch (e) {
    console.log("Problem Happened");
    process.exit(1);
  }
};
initializeServer();

// app.get("/todo/", async (request, response) => {
//   const todoQuery = `SELECT * FROM todo;`;
//   const arrayPlayers = await db.all(todoQuery);
//   response.send(arrayPlayers);
// });
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  //   response.send(status);
  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
     SELECT
      *
     FROM
      todo
     WHERE
      todo LIKE '%${search_q}%'
      AND status = '${status}'
      AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
     SELECT
      *
     FROM
      todo
     WHERE
      todo LIKE '%${search_q}%'
      AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
     SELECT
      *
     FROM
      todo
     WHERE
      todo LIKE '%${search_q}%'
      AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
     SELECT
      *
     FROM
      todo
     WHERE
      todo LIKE '%${search_q}%';`;
  }
  data = await database.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const arrayTodo = await db.get(todoQuery);
  //   const arrayTodo1 = [arrayTodo];
  //   const r = arrayPlayers1.map((eachPlayer) => snakeToCamel(eachPlayer));
  response.send(arrayTodo);
});

app.post("/todos/", async (request, response) => {
  //   const todoDetails = request.body;
  const { id, todo, priority, status } = request.body;
  //   console.log(todoDetails);
  const todoAddQuery = `INSERT INTO todo (id,todo,priority,status)
      VALUES ('${id}','${todo}','${priority}','${status}');`;
  await db.run(todoAddQuery);
  //   console.log(todo);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateColumn = "";
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  console.log(requestBody);
  const previousTodoQuery = `
      SELECT *
      FROM todo
      WHERE id=${todoId};`;
  const previousQuery = await db.get(previousTodoQuery);

  const {
    todo = previousQuery.todo,
    priority = previousQuery.priority,
    status = previousQuery.status,
  } = request.body;
  console.log(todo);
  const updateQuery = `
    UPDATE
      todo
    SET
      todo=${todo},
      priority=${priority},
      status=${status}
    WHERE
      id=${todoId};`;
  await db.run(updateQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
  todo
  WHERE
  id=${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
