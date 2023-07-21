const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");


const app=express();

app.set("view engine","ejs");

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema={
      name:String
};

const Item=mongoose.model("Item",itemsSchema);

const item1= new Item({
      name:"Welcome to your todolist"
});

const item2= new Item({
      name:"Hit the + button to aff a new item"
});

const item3= new Item({
      name:"<--- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const ListSchema={
      name:String,
      items:[itemsSchema]
};

const List=mongoose.model("List",ListSchema);



app.get("/",function(req,res){



      Item.find({}).then(function(foundItems){

            if(foundItems.length==0){
                  Item.insertMany(defaultItems)
                  .then(function(){
                 console.log("Successfully saved into our DB.");
                    })
                  .catch(function(err){
                    console.log(err);
                     });
                     res.redirect("/");
            }
            else{
                  res.render("list", { listtitle: "Today", newlistitems: foundItems });
            }

            
          })
          .catch(function(err){
            console.log(err);
          });
     
     

});

app.post("/",function(req,res){

      let itemName = req.body.newitem
      let listName = req.body.list
   
      const item = new Item({
          name: itemName,
      })
   
      if (listName === "Today") {
          item.save()
          res.redirect("/")
      } else {
   
          List.findOne({ name: listName }).exec().then(foundList => {
              foundList.items.push(item)
              foundList.save()
              res.redirect("/" + listName)
          }).catch(err => {
              console.log(err);
          });
      }
  })

app.post("/delete", function(req,res){
      const checkedItemId= req.body.checkbox;
      const listName=req.body.listName;

      if(listName=="Today"){
      Item.findByIdAndRemove(checkedItemId)
      .then(function(){    
                  console.log("Successfully deleted checked item.");        
      })
      .catch(function(err){
            console.log(err);
      })
      res.redirect("/");
        }
        else{
            List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function (foundList)
            {
              res.redirect("/" + listName);
            });
        }

});

app.get("/:customListName",function(req,res){
     
      const customListName = req.params.customListName;
 
      List.findOne({name:customListName})
        .then(function(foundList){
            
              if(!foundList){
                const list = new List({
                  name:customListName,
                  items:defaultItems
                });
              
                list.save();
                console.log("saved");
                res.redirect("/"+customListName);
              }
              else{
                res.render("list",{listtitle:foundList.name, newlistitems:foundList.items});
              }
        })
        .catch(function(err){});


})

app.get("/about",function(req,res){
      res.render("about");
})

app.listen(3000,function(){
      console.log("server started on port 3000");
});