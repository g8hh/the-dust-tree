//https://optimistic-snyder-de15e4.netlify.app/

cr_data={
  resources: {
    100:[
      {name:"dust",c:"#AAAAAA"},
      {name:"compressed dust",c:"#888888"},
      {name:"dust bricks",c:"#AAAAAA"},
      {name:"engraved bricks",c:"#AAAAAA"},
      {name:"dust shard",c:"#BBBBBB"},
      {name:"dust pebbles",c:"#CCCCCC"},
    ],
    200:[
      {name:"lively dust",c:"#C97ACC"},
      {name:"lively pebbles",c:"#85A87D"},
      {name:"lively chunk",c:"#85A87D"},
      {name:"biomass",c:"#85A87D"},
    ],
    300:[
      {name:"responsive dust",c:"#DBC046"},
      {name:"responsive cable",c:"#DBC046"},
      {name:"logic slate",c:"#DBC046"},
      {name:"cross slate",c:"#DBC046"},
      {name:"togglable slate",c:"#DBC046"},
    ]
  },
  craft_data:{
    "dustCdust":[{a:1,r:"compressed dust"}],
    "compressed dustCcompressed dust":[{a:1,r:"dust bricks"}],
    "dust bricksCdust bricks":[{a:3,r:"dust shard"}],
    "dust bricksCdust shard":[{a:1,r:"engraved bricks"},{a:1,r:"dust shard"}],
    "dust bricksCcompressed dust":[{a:1,r:"dust bricks"},{a:3,r:"dust pebbles"}],
    "dust pebblesClively dust":[{a:1,r:"lively pebbles"}],
    "lively pebblesClively pebbles":[{a:1,r:"lively chunk"}],
    "lively chunkClively chunk":[{a:1,r:"biomass"}],
    "engraved bricksCdust":[{a:1,r:"engraved bricks"},{a:1,r:"lively dust"},{a:1,r:"responsive dust"}],
    "lively dustCresponsive dust":[{a:1,r:"dust"}],
    "responsive dustCdust shard":[{a:1,r:"responsive cable"}],
    "responsive dustCengraved bricks":[{a:1,r:"cross slate"}],
    "responsive dustCcross slate":[{a:1,r:"logic slate"}],
    "engraved bricksCcross slate":[{a:1,r:"togglable slate"}],
  },
  nameid:{}
}

cr_startdata={
  scroungeable_dust: new Decimal("2e6"),
  unlocked: true,
  selected: "",
  items: {}
}

for ([column,resources] of Object.entries(cr_data.resources)){
  for ([row,resource] of Object.entries(resources)){
    let id=""+(Number(column)+Number(row)+1)
    resource.id=id
    cr_data.nameid[resource.name]=id
    cr_data.resources[id]=resource
  }
  delete cr_data.resources[column]
}

//grid getting funcs
{
//called internally for new items
function cr_newitem(id){
  return {amount: new Decimal(0), haveseen: false}
}
//gets all of an item's data
function cr_getobj(id){
  if (typeof id=="string"){id=cr_data.nameid[id]}
  if (!cr_data.resources[id]){return {}}
  let itemname=cr_data.resources[id].name
  if (!player.cr.items[itemname]){
    player.cr.items[itemname]=cr_newitem(id)
  }
  return player.cr.items[itemname]
}
//gets an item's amount
function cr_getitem(id){
  //return new Decimal(0)
  
  if (typeof id=="string"){id=cr_data.nameid[id]}
  if (!cr_data.resources[id]){
    return new Decimal(0)
  }
  let itemname=cr_data.resources[id].name
  if (!player.cr.items[itemname]){
    player.cr.items[itemname]=cr_newitem(id)
  }
  if (!player.cr.items[itemname].amount.add){
    console.log(`fixing ${itemname}, be more careful!`)
    player.cr.items[itemname].amount=new Decimal(player.cr.items[itemname].amount)
  }
  return player.cr.items[itemname].amount
}
//sets an item's amount to a given value
function cr_setitem(id,amt){
  //in case amt is passed as a normal value
  amt=new Decimal(amt)
  //so id can be things like "dust"
  if (typeof id=="string"){id=cr_data.nameid[id]}
  //and non-resources shouldn't be accessible
  if (!cr_data.resources[id]){return}
  let itemname=cr_data.resources[id].name
  if (!player.cr.items[itemname]){
    player.cr.items[itemname]=cr_newitem(id)
  }
  if (!player.cr.items[itemname].haveseen){
    if (player.cr.items[itemname].amount.gte(0)){
      player.cr.items[itemname].haveseen=true
    }
  }
  setGridData("cr",id,!getGridData("cr",id))
  player.cr.items[itemname].amount=amt
}
//returns if the item's amount is >= to given value
function cr_hasitem(id,amt){
  return cr_getitem(id).gte(amt)
}
//adds a given value from an item
function cr_additem(id,amt){
  item_amt=cr_getitem(id)
  if (item_amt){
    cr_setitem(id,item_amt.add(amt))
  }
}
//subtracts a given value from an item
function cr_subitem(id,amt){
  if (cr_hasitem(id,amt)){
    cr_setitem(id,cr_getitem(id).sub(amt))
  }
  return cr_hasitem(id,amt)
}
//gets item's grid id given its name
function cr_getidname(id){
  if (typeof id=="string"){id=cr_data.nameid[id]}
  if (!cr_data.resources[id]){
    return new Decimal(0)
  }
  let itemname=cr_data.resources[id].name
  return itemname
}
}
//misc
{
function cr_select_resource(button){
  if (player.cr.selected==button){
    player.cr.selected=""
  }else{
    player.cr.selected=button
  }
}
function cr_getcraftstyle(button){
  let itemname=getClickableState(button.layer,button.id)
  let id=cr_data.nameid[itemname]
  let col="#000000"
  if (cr_data.resources[id]){
    col=cr_data.resources[id].c
  }
  let style={"background-color": "#222222"}
  if (cr_getitem(itemname)){
    if (cr_getitem(itemname).gt(0)){
      style["background-color"]=col
    }
  }
  return style
}
}

let data={
    name: "crafting", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return cr_startdata},
    color: "#AAAAAA",
    type: "none",
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [],
    buyables: {
      11: {
        display() { return `${player.cr.scroungeable_dust} renaining\n${cr_getitem("dust")} dust in storage.\ngather ${this.cost()} dust` },
        canAfford() { return player.cr.scroungeable_dust.gt(0) },
        cost() {return 1},
        buy() {
            player.cr.scroungeable_dust = player.cr.scroungeable_dust.sub(this.cost())
            cr_additem("dust",1)
        },
        onHold(){},
      },
    },
    clickables: {
      rows:9,
      cols:9,
      11: {
        canClick() {return true},
        onClick() {
          if (player.cr.selected){
            setClickableState(this.layer,this.id,player.cr.selected)
            player.cr.selected=""
          }
        },
        display() {return getClickableState(this.layer,this.id)},
        style(){return cr_getcraftstyle(this)}
      },
      12: {
        canClick() {return true},
        onClick() {
          if (player.cr.selected){
            setClickableState(this.layer,this.id,player.cr.selected)
            player.cr.selected=""
          }
        },
        display() {return getClickableState(this.layer,this.id)},
        style(){return cr_getcraftstyle(this)}
      },
      13: {
        canClick() {
          let ing1=getClickableState(this.layer,11)
          let ing2=getClickableState(this.layer,12)
          if (cr_data.craft_data[ing1+"C"+ing2]||cr_data.craft_data[ing2+"C"+ing1]){
            return ((cr_hasitem(ing1,1)&&cr_hasitem(ing2,1))&&
            (!(ing1==ing2) || cr_hasitem(ing1,2)))//if they're the same, check you have 2 of em
            
          }
        },
        onClick() {
          let ing1=getClickableState(this.layer,11)
          let ing2=getClickableState(this.layer,12)
          let result=cr_data.craft_data[ing1+"C"+ing2]
          if (!result){
            result=cr_data.craft_data[ing2+"C"+ing1]
          }
          if (
            (cr_hasitem(ing1,1)&&cr_hasitem(ing2,1))&&
          (!(ing1==ing2) || cr_hasitem(ing1,2))//if they're the same, check you have 2 of em
          
          ){
            for(i in result){
              cr_additem(result[i].r,result[i].a)
            }
            cr_subitem(ing1,1)
            cr_subitem(ing2,1)
          }
        },
        display() {
          let ing1=getClickableState(this.layer,11)
          let ing2=getClickableState(this.layer,12)
          let result=cr_data.craft_data[ing1+"C"+ing2]
          if (!result){result=cr_data.craft_data[ing2+"C"+ing1]}
          if (!result) return "no craftable item"
          let output=""
          for(i in result){
            output+=`${result[i].a}x ${result[i].r}\n`
          }
          return output
        }
      },
    },
    tabFormat: {
      "dust gathering": {
          content: ["buyables"],
      },
      "crafting": {
          content: ["clickables","grid"],
      },
    },
    grid: {
      rows: 10,
      cols: 7,
      getStartData(id) {
          return true
      },
      getUnlocked(id) { // Default
          return true
      },
      getCanClick(data, id) {
          return true
      },
      getStyle(data, id) {
        let col="#000000"
        let is_selected=false
        if (cr_data.resources[id]){
          col=cr_data.resources[id].c
          is_selected=player.cr.selected==cr_data.resources[id].name
        }
        let style={"background-color": "#222222"}
        if (cr_getitem(id)){
          if (cr_getitem(id).gt(0)){
            style["background-color"]=(is_selected?LightenDarkenColor(col,64):col)
          }
        }
        return style
      },
      onClick(data, id) { // Don't forget onHold
          if (cr_data.resources[id]){
            cr_select_resource(cr_data.resources[id].name)
          }
      },
      getTitle(data, id) {
          if (cr_data.resources[id]){
            if (cr_getobj(id).haveseen){
              return cr_data.resources[id].name
            }else{
              return "none"
            }
          }else{
            return "none"
          }
      },
      getDisplay(data, id) {
          return cr_getitem(id)
      },
    },
    layerShown(){return true}
}

sigamount=0

addLayer("cr", data)
