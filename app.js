const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require('lodash');

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin_ayush:Test123@cluster0.aurzbxr.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


const todolistSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [todolistSchema]
});

const Item = mongoose.model("Item", todolistSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to the todolist"
});

const item2 = new Item({
  name: "Hit the + button to add new items."
});

const item3 = new Item({
  name: "<-- hit this to delete items."
});

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find(function(err, items) {

    if (items.length === 0) {

      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log("Error under insert " + err);
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: day,
        items: items
      });
    }
  });

});

app.post("/delete", function(req, res) {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === date.getDate()) {
    Item.deleteOne({_id: itemId}, function(err) {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: itemId}}}, function(err){
      if (!err) {
        res.redirect("/"+listName);
      }
    })
  }

});

app.get("/:customList", function(req, res) {
  const customListName = _.capitalize(req.params.customList);

  List.findOne({ name: customListName }, function(err, foundList) {

    if (!err) {

      if (!foundList) {
        // Newly created list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // showing lists
        res.render("list", {
          listTitle: customListName,
          items: foundList.items
        });
      }
    }
  });

});

app.post("/:customList", function(req,res){

  const customListName = req.params.customList;

  List.findOneAndUpdate({name: customListName},{items: "New Item"});
  res.redirect("/"+ customListName);
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.post("/", function(req, res) {

  const newItem = req.body.newItem;
  const listName= req.body.list;

  const item = new Item({
    name: newItem
  });

  if (listName === date.getDate()) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err,foundList){
      if(!err){
        foundList.items.push(item);
        foundList.save();
      }
    });
    res.redirect("/"+listName);
  }

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
