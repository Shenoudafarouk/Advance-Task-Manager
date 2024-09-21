require("dotenv").config();

const express = require("express");

const morgan = require("morgan");

const cors = require("cors");
const { swaggerUi, swaggerDocument } = require('./swagger'); // Import Swagger setup

const httpStatusText = require("./utils/httpStatusText");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const taskRouter = require("./routes/task.route");

const userRouter = require("./routes/user.route");

app.use("/api/tasks", taskRouter);

app.use("/api/users", userRouter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use(cors());

app.use("*", (req, res, next) =>
  res.status(400).json({
    status: httpStatusText.ERROR,
    message: "This resource is not availble",
  })
);

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/api`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});

process.on("unhandledRejection", (err) => {
  console.error(`UnhandeledRejection error : ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("shutting down...");
    process.exit(1);
  });
});
