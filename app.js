const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// connect to mongoDB and use wikiDB database

mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// create a new collection or document
// first create article
const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
});

// create new article model
const Article = mongoose.model("article", articleSchema);

// during refactoring we use app.route express method to chain the app.get, app.post and app.delete methods as app.route("/articles").get().post().delete()
// since they target a single "/articles" route. the relevant callback funstions are then inserted into the parenthesis()

// /////////////////////////////REQUESTS TARGETING ALL ARTICLES ////////////////////////////////////////////
app
  .route("/articles")
  .get(
    // create get route that fatches all the articles
    function (req, res) {
      // query database and find all the documents in the articles collection
      Article.find(function (err, foundArticles) {
        // send foundArticles back to user instead of console logging
        if (!err) {
          res.send(foundArticles);
        } else {
          res.send(err);
        }
      });
    }
  )
  .post(
    // to handle posts from the client without building a form, we use postman
    function (req, res) {
      //   the title and content in the newArticle collection come through user post requests
      //   this way the user can add the collection into the mongoDb database

      const newArticle = new Article({
        title: req.body.title,
        content: req.body.content,
      });

      //   note that the save method can take a callback function as shown
      newArticle.save(function (err) {
        if (!err) {
          res.send("Successfully added a new article!");
        } else {
          res.send(err);
        }
      });
    }
  )
  .delete(
    // client delete request
    function (req, res) {
      Article.deleteMany(function (err) {
        if (!err) {
          res.send("Successfully deleted all articles!");
        } else {
          res.send(err);
        }
      });
    }
  );

// /////////////////////////////REQUESTS TARGETING A SPECIFIC ARTICLE ////////////////////////////////////////////

app
  .route("/articles/:articleTitle")
  .get(function (req, res) {
    // use the findOne method specifing condtions
    Article.findOne({ title: req.params.articleTitle }, function (
      err,
      foundArticle
    ) {
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send(err);
      }
    });
  })
  .put(function (req, res) {
    // use mongoDB to replce a partiticular document in the collection
    Article.update(
      // search for an article that matches the client request
      { title: req.params.articleTitle },
      // replace the title and content respectively
      { title: req.body.title, content: req.body.content },
      { overwrite: true },
      function (err) {
        if (!err) {
          res.send("Successfully updated article!");
        }
      }
    );
  })
  // update a specific field in a specific document
  .patch(function (req, res) {
    Article.update(
      { title: req.params.articleTitle },
      // body-parser passes the user request to patch title or content or both
      { $set: req.body },
      function (err) {
        if (!err) {
          res.send("Successfuly update article!");
        } else {
          res.send(err);
        }
      }
    );
  })

  // delete article from collection
  .delete(function (req, res) {
    Article.deleteOne({ title: req.params.articleTitle }, function (err) {
      if (!err) {
        res.send("Successfully deleted the article!");
      } else {
        res.send(err);
      }
    });
  });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
