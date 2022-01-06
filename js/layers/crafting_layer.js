//https://optimistic-snyder-de15e4.netlify.app/

//https://raw.githack.com/chipsams/The-Modding-Tree/master/index.html

cr_data={
  resources: {
    100:[//dust stuff
      {name:"dust",c:"#b9bffb"},
      {name:"compressed dust",c:"#849be4"},
      {name:"dust bricks",c:"#b9bffb"},
      {name:"engraved bricks",c:"#b9bffb"},
      {name:"dust shard",c:"#e3e6ff"},
      {name:"dust pebbles",c:"#849be4"},
    ],
    200:[//biomass & lively stuff
      {name:"lively dust",c:"#f5a097"},
      {name:"lively pebbles",c:"#f5a097"},
      {name:"lively chunk",c:"#f5a097"},
      {name:"biomass",c:"#14a02e"},
    ],
    300:[//wire stuff
      {name:"responsive dust",c:"#ffd541"},
      {name:"responsive cable",c:"#e3e6ff"},
      {name:"logic slate",c:"#ffd541"},
      {name:"cross slate",c:"#ffd541"},
      {name:"togglable slate",c:"#ffd541"},
    ],
    400:[//qol items
      {name:"memory chip",c:"#849be4"},
      {name:"recipe chip",c:"#f5a097"},
      {name:"blueprint chip",c:"#b9bffb"},
      {name:"divisive chip",c:"#ffd541"},
    ],
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
    "engraved bricksCdust shard":[{a:1,r:"memory chip"}],
    "memory chipClively dust":[{a:1,r:"recipe chip"}],
    "memory chipCdust":[{a:1,r:"blueprint chip"}],
    "memory chipCresponsive dust":[{a:1,r:"divisive chip"}],
  },
  nameid:{},
}

cr_startdata={
  scroungeable_dust: new Decimal("2e6"),
  unlocked: true,
  selected: "",
  items: {},
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
  return {amount: new Decimal(0),lifetime_max: new Decimal(0), haveseen: false}
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
  player.cr.items[itemname].amount=player.cr.items[itemname].amount.max(amt)
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
  if (cr_getitem(button).gt(0)){
    if (player.cr.selected==button){
      player.cr.selected=""
    }else{
      player.cr.selected=button
    }
  }
}
function cr_getcraftstyle(button){
  let itemname=getClickableState(button.layer,button.id)
  let id=cr_data.nameid[itemname]
  let col="#000000"
  if (cr_data.resources[id]){
    col=cr_data.resources[id].c
  }
  let style={"background-color": "#222222","border-radius":"10px"}
  if (cr_getitem(itemname)){
    if (cr_getitem(itemname).gt(0)){
      style["background-color"]=col
    }
  }
  return style
}
function cr_getgrad(result){
  let grad=`linear-gradient(${90*3/8}deg,`
  for(let i=0;i<result.length;i++){
    grad+=cr_data.resources[cr_data.nameid[result[i].r]].c+" "+Math.floor(i/(result.length)*100)+"%"+","
    grad+=cr_data.resources[cr_data.nameid[result[i].r]].c+" "+Math.floor((i+1)/(result.length)*100-1)+"%"+((i<result.length-1)?",":")")
  }
  return grad
}
}

function cr_getresult(ing1,ing2){
  let result=cr_data.craft_data[ing1+"C"+ing2]
  if (!result){
    result=cr_data.craft_data[ing2+"C"+ing1]
  }
  return result
}

cr_t=0

let data={
  name: "crafting", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "CR", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() { return cr_startdata},
  color: "#b9bffb",
  type: "none",
  row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [],
    update(diff){
      cr_t+=diff
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
          return cr_getresult(ing1,ing2)?true:false
        },
        style(){
          let ing1=getClickableState(this.layer,11)
          let ing2=getClickableState(this.layer,12)
          let result=cr_getresult(ing1,ing2)
          let grad="#222222"
          if(result){
            grad=cr_getgrad(result)
          }
          return {
            "background": grad,
            "border": "none",
            "width": "120px",
            "border-radius": "10px 10px 10px 10px"
          }
        },
        onClick() {
          let ing1=getClickableState(this.layer,11)
          let ing2=getClickableState(this.layer,12)
          let result=cr_getresult(ing1,ing2)
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
        onHold(){this.onClick()},
        display() {
          let ing1=getClickableState(this.layer,11)
          let ing2=getClickableState(this.layer,12)
          let result=cr_getresult(ing1,ing2)
          if (!result) return "no craftable item"
          let output=""
          for(i in result){
            output+=`${result[i].a}x ${result[i].r}\n`
          }
          return output
        }
      },
      14: {
        canClick() {return cr_getitem("recipe chip").gt(0)},
        onClick() {
          cr_subitem("recipe chip",1)
        },
        display() {return `save to chip\n(x${cr_getitem("recipe chip")})`},
        style(){
          let ing1=getClickableState(this.layer,11)
          let ing2=getClickableState(this.layer,12)
          let result=cr_getresult(ing1,ing2)
          if(!result||cr_getitem("recipe chip").lte(0)){
            return {
              "background": "#22222200",
              "height": "0px",
              "min-height": "0px",
              "width": "50px",
              "border-radius": "0px 1000px 1000px 0px",
              "overflow":"hidden",
              "color":"#00000000",
              "vertical-align":"text-top",
              "border-width":"0px",
              "border": "none",
            }
          }
          return {
            "background": "#b9bffb",
            "height": "90px",
            "min-height": "0px",
            "width":"50px",
            "border-radius": "0px 10px 10px 0px",
            "color":"black",
            "overflow":"hidden",
            "vertical-align":"text-top",
            "border-width":"0px",
            "border": "none",
          }
        }
      },
    },
    layerShown(){player.co.lifetime_scrounged.gte(30)?true:"ghost"},
    tabFormat: [
      ["row",[
        ["blank",["50px","1px"]],
        ["clickable",11],
        ["clickable",12],
        ["blank",["50px","50px"]],
        ["column",[
        ]],
        ["clickable",13],
        ["clickable",14]
      ]],
      "blank",
      "grid"
    ],
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
      getCol(id){
        if (cr_getitem(id).gt(0)){
          if (cr_data.resources[id]){
            let col=cr_data.resources[id].c
            let is_selected=player.cr.selected==cr_data.resources[id].name
            return (is_selected?LightenDarkenColor(col,64):col)
          }
        }
        return "#222222"
      },
      getStyle(data, id) {
        let col="#000000"
        let is_selected=false
        if (cr_data.resources[id]){}
        let style={
          "background-color": "#222222",
          "background-size": "auto 100%",
          "padding-bottom": "40%"
        }
        style["background-position"]="0% 0%"
        style["background-image"]='url("./blank.png")'
        if (cr_getitem(id)){
          if (cr_getitem(id).gt(0)){
            style["background-color"]=this.getCol(id)
            style["background-position"]=`${(id%100+Math.floor(id/100)*9)*-100+1000}% 0%`
            style["background-image"]='url("./items_E.png")'
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
          let title=""
          let top_title="none"
          if (cr_data.resources[id]){
            if (cr_getobj(id).haveseen){
              top_title=cr_data.resources[id].name
            }
          }
          title+=`<div style="
          position: absolute;
          left: 5%;
          top:  5%;
          text-align: left;
          border-radius: 0% 0% 4px 4px;
          font-size: 50%;
          color: ${cr_getitem(id).gt(0)?"white":"black"};
          padding-left: 10px;
          padding-right: 10px;
          background-color: #22222244;
          ">${top_title}</div>` 

          title+=`<div 
          style="
          color: ${cr_getitem(id).gt(0)?"white":"black"};
          border-radius: 4px 4px 0% 0%;
          padding-left: 10px;
          padding-right: 10px;
          background-color: #22222244;
          text-align: right;
          font-size: 100%;
          position: absolute;
          right:    5%;
          bottom:   5%;
          ">${cr_getitem(id)}</div>`
          return title
      },
      getTooltip(data,id){
        if (cr_data.resources[id]){
          if (cr_getobj(id).haveseen){
            return cr_data.resources[id].name
          }
        }
        return "none"
      }
    },
    layerShown(){return player.re.upgrades.includes(11)},
    tooltip(){return "manual crafting"}
}

sigamount=0

addLayer("cr", data)
