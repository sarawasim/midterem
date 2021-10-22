const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const db = mongoose.connect("mongodb://localhost/courseAPI");
const Course = require("./models/courseModel");
const courseRouter = express.Router();
const port = process.env.PORT || 3000;
const fs = require('fs')
const { networkInterfaces } = require('os');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

courseRouter.use(function (req, res, next) {
  const nets = networkInterfaces();
  const getIp = () => {
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
  }
  
  const data = `${new Date().toUTCString()} - ${getIp()}\n`
  fs.appendFile('log.txt', data, (err) => {
  if (err) throw err;
  console.log('Data added to log.txt');
  });
  next();
})



courseRouter
  .route("/courses")
  .get((req, res) => {
    const query = {};
    if (req.query.genre) {
      query.genre = req.query.genre;
    }
    Course.find(query, (err, courses) => {
      if (err) {
        return res.send(err);
      }
      return res.json(courses);
    });
  })
  .post((req, res) => {
    const course = new Course(req.body);
    course.save();
    return res.status(201).json(course);
  });


courseRouter.use("/courses/:courseId", (req, res, next) => {
  Course.findById(req.params.courseId, (err, course) => {
    if (err) {
      return res.send(err);
    }
    if (course) {
      req.course = course;
      return next();
    }
    return res.sendStatus(404);
  });
});

courseRouter
  .route("/courses/:courseId")
  .delete((req, res) => {
    req.course.remove((err) => {
      const { course } = req;
      if (err) {
        return res.send(err);
      }
      return res.json(course);
    });
  })
  .patch((req, res) => {
    const { course } = req;

    if (req.body._id) {
      delete req.body._id;
    }
    Object.entries(req.course).forEach((item) => {
      const key = item[0];
      const value = item[1];
      course[key] = value;
    });
    req.course.save((err) => {
      if (err) {
        return res.send(err);
      }
      return res.json(course);
    });
  })
  .put((req, res) => {
    const { course } = req;
    course.day = req.body.day;
    course.title = req.body.title;
    course.time = req.body.time;
    course.location = req.body.location;
    course.save();
    return res.json(course);
  })
  .get((req, res) => {
    const {course} = req
    return res.json(course)
  });

app.use("/api", courseRouter);

app.get("/", (req, res) => {
  res.send("Welcome to my API!");
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
