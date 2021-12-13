//https://optimistic-snyder-de15e4.netlify.app/

cr_data={
  resources: {
    100:[
      {name:"dust",c:"#AAAAAA"},
      {name:"compressed dust",c:"#888888"},
      {name:"pressed dust",c:"#888888"},
      {name:"dust bricks",c:"#AAAAAA"},
      {name:"dust shard",c:"#BBBBBB"},
      {name:"engraved brick",c:"#AAAAAA"},
    ],
    200:[
      {name:"lively dust",c:"#C97ACC"},
      {name:"biomass",c:"#85A87D"},
      {name:"log",c:"#A2552A"},
    ],
    300:[
      {name:"responsive dust",c:"#DBC046"}
    ]
  },
  craft_data:{
    "dustCdust":[{a:1,r:"compressed dust"}],
    "compressed dustCcompressed dust":[{a:1,r:"dust bricks"}],
    "dust bricksCdust bricks":[{a:3,r:"dust shard"}],
    "dust bricksCdust shard":[{a:1,r:"engraved brick"},{a:1,r:"dust shard"}],
    "dust bricksCcompressed dust":[{a:1,r:"pressed dust"}],
    "dust bricksCdust":[{a:1,r:"biomass"}],
    "biomassCdust shard":[{a:1,r:"log"}],
  },
  nameid:{}
}

cr_startdata={
  scroungeable_dust: new Decimal(1000),
  unlocked: true,
  points: new Decimal(0),
  items: {
  },
  selected: ""
}

for ([column,resources] of Object.entries(cr_data.resources)){
  for ([row,resource] of Object.entries(resources)){
    let id=""+(Number(column)+Number(row)+1)
    resource.id=id
    cr_data.nameid[resource.name]=id
    cr_startdata.items[resource.name]={amount: new Decimal(1)}
    cr_data.resources[id]=resource
  }
  delete cr_data.resources[column]
}

function cr_getitem(id){
  if (typeof id=="string"){id=cr_data.nameid[id]}
  return player.cr.items[cr_data.resources[id].name].amount
}
function cr_setitem(id,amt){
  if (typeof id=="string"){id=cr_data.nameid[id]}
  getGridData("cr",id).amount=amt
  player.cr.items[cr_data.resources[id].name].amount=amt
}

function cr_additem(id,amt){
  if (typeof id=="string" && !Number(id)){id=cr_data.nameid[id]}
  id+=""
  getGridData("cr",id).amount=getGridData("cr",id).amount.add(amt)
}

function cr_hasitem(id,amt){
  if (typeof id=="string" && !Number(id)){id=cr_data.nameid[id]}
  id+=""
  return getGridData("cr",id).amount.gte(amt)
}

function cr_subitem(id,amt){
  if (typeof id=="string" && !Number(id)){id=cr_data.nameid[id]}
  id+=""
  if (cr_hasitem(id,amt)){
    getGridData("cr",id).amount=getGridData("cr",id).amount.sub(amt)
    return true
  }else{
    return false
  }
}

let data={
    name: "crafting", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return cr_startdata},
    color: "#4BDC13",
    type: "none",
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [],
    buyables: {
      11: {
        display() { return `${player.cr.scroungeable_dust} renaining\n${cr_getitem("dust").amount} dust in storage.\ngather ${this.cost()} dust` },
        canAfford() { return player.cr.scroungeable_dust.gt(0) },
        cost() {return 1},
        buy() {
            player.cr.scroungeable_dust = player.cr.scroungeable_dust.sub(this.cost())
            cr_additem("dust",1)
        },
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
        display() {return getClickableState(this.layer,this.id)}
      },
      12: {
        canClick() {return true},
        onClick() {
          if (player.cr.selected){
            setClickableState(this.layer,this.id,player.cr.selected)
            player.cr.selected=""
          }
        },
        display() {return getClickableState(this.layer,this.id)}
      },
      13: {
        canClick() {
          if (cr_data.craft_data[getClickableState(this.layer,11)+"C"+getClickableState(this.layer,12)]){
            let ing1=getClickableState(this.layer,11)
            let ing2=getClickableState(this.layer,12)
            return ((cr_hasitem(ing1,1)&&cr_hasitem(ing2,1))&&
            (!(ing1==ing2) || cr_hasitem(ing1,2)))//if they're the same, check you have 2 of em
            
          }
        },
        onClick() {
          let ing1=getClickableState(this.layer,11)
          let ing2=getClickableState(this.layer,12)
          if (
          (cr_hasitem(ing1,1)&&cr_hasitem(ing2,1))&&
          (!ing1==ing2 || cr_hasitem(ing1,2))//if they're the same, check you have 2 of em
          
          ){
            let result=cr_data.craft_data[ing1+"C"+ing2]
            cr_additem(result[0].r,1)
            cr_subitem(ing1,1)
            cr_subitem(ing2,1)
          }
        },
        display() {
          let result=cr_data.craft_data[getClickableState(this.layer,11)+"C"+getClickableState(this.layer,12)]
          if (!result) return "no craftable item"
          return `${result[0].r}`
        }
      },
    },
    tabFormat: {
      "Main tab": {
          content: ["buyables"],
      },
      "Other tab": {
          content: ["clickables","grid"],
      },
    },
    grid: {
      rows: 7,
      cols: 6,
      getStartData(id) {
          let data={amount: new Decimal(0)}
          return data
      },
      getUnlocked(id) { // Default
          return true
      },
      getCanClick(data, id) {
          return true
      },
      getStyle(data, id) {
          col="#000000"
          if (cr_data.resources[id]){
            col=cr_data.resources[id].c
          }
          return {'background-color': data.amount.gt(0)?(player.cr.selected==cr_data.resources[id].name?LightenDarkenColor(col,64):col):"#222222"}
      },
      onClick(data, id) { // Don't forget onHold
          if (cr_data.resources[id]){
            cr_select_resource(cr_data.resources[id].name)
          }
      },
      getTitle(data, id) {
          if (cr_data.resources[id]){
            return cr_data.resources[id].name
          }else{
            return "none"
          }
      },
      getDisplay(data, id) {
          return data.amount
      },
    },
    layerShown(){return true}
}

function cr_select_resource(button){
  if (player.cr.selected==button){
    player.cr.selected=""
  }else{
    player.cr.selected=button
  }
}


addLayer("cr", data)
