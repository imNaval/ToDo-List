//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connect to database
//local server
// const url = "mongodb://127.0.0.1:27017/todolistDB";
//cloud Server
const url = "mongodb+srv://Naval:Navwe%401998@cluster0.u8jd2to.mongodb.net/todolistDB?retryWrites=true&w=majority"
mongoose.set('strictQuery', false);
mongoose.connect(url);

//create Schema
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);
const item1  = new Item({
  name: "Drink Milk"
});
const item2  = new Item({
  name: "Solve Problems"
});
const item3  = new Item({
  name: "Skill Up Yourself"
});

const defaultItem = [item1, item2, item3];


//list Schema ***
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);



//
app.get("/", function(req, res) {
// const day = date.getDate();

Item.find({}, function(err, items){
  if(err){
    console.log(err);
  }else {
    if(items.length === 0){
      Item.insertMany(defaultItem, function(err){
        if(err){
          console.log(err);
        }else {
          console.log("succssfully saved default item to DB");
        }
      });
      res.redirect("/");
    }else {
        res.render("list", {listTitle: "Today", newListItems: items});
    }
  }
 });
});

//add item
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save()  // <--sort-cut of insert
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, result){
      if(!err){
        result.items.push(item);
        result.save();
        res.redirect("/" + listName);
      }
    })
  }

});

//delete item
app.post("/delete", function(req, res){
  // console.log(req.body.checkbox);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err, docs){
    if (err) {
      console.log(err);
    }else {
      console.log("removed ", docs);
      res.redirect("/");
    }
  })
}else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}

});


app.get("/:customRequest", function(req, res){
  customRequest = _.capitalize(req.params.customRequest);
  List.findOne({name: customRequest}, function(err, result){
    if(!err) {
      if(!result){
        //creae new list
        const list = new List({
          name: customRequest,
          items: defaultItem
        });
        list.save();
        res.redirect("/" + customRequest);
      }else {
        //show exist list
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
    }
  })

});

app.get("/about", function(req, res){
  res.render("about");
});

//listening
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
