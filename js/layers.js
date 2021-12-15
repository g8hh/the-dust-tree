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
      {name:"signal slate",c:"#DBC046"},
      {name:"logic slate",c:"#DBC046"},
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
    "responsive dustCengraved bricks":[{a:1,r:"signal slate"}],
    "responsive dustCsignal slate":[{a:1,r:"logic slate"}],
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
//updates the connected wire sprites
cr_orderofchecks=[
  {x: 1,y: 0},
  {x: 0,y: 1},
  {x:-1,y: 0},
  {x: 0,y:-1}
]
function cr_updatesprite(id){
  if(id%100<=1||id%100>=9||id<200||id>900){return}
  let spr=0
  for (l=0;l<=3;l++){
    let o=cr_orderofchecks[l]
    let data=getGridData("ma",id+o.x+o.y*100)
    spr+=data.contents!==""||data.toggle!==-1?2**(l):0
  }
  getGridData("ma",id).wire_sprite=spr
  setGridData("ma",id,getGridData("ma",id))
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


addLayer("cr", data)

addLayer("ma", {
  name: "machining",
  symbol: "MA",
  startData() { return {points: new Decimal(0),}},
  type: "none",
  color: "#DBC046",
  grid: {
    rows:9,
    cols:9,
    getStartData(){
      txt=""
      //held signal format
      /*
        {
          value: (regular number),
          prevpos: (id (202, e.g), will move if there is a free wire that isn't prevpos)
        }
        conflicts in movement are resolved by sending the biggest number first. (negating everything therefore could be used to send the minimum)
        addition =a-(0-b)
        
      */
      let data={contents:txt,wire_sprite:1,held_signal:null}
      if (id%100==1||id%100==9||id<200||id>=900){
        data.toggle=-1
      }
      return data
    },
    getTitle(data,id){
      return ""
    },
    getDisplay(data,id){},
    onClick(data,id){
      if (player.subtabs.ma.mainTabs=="designer"){
        
        if ((id%100==1||id%100==9||id<200||id>900)){
          let toggle=data.toggle
          data.toggle=!toggle
          if(id<200   ){for (let l=101;l<=109;l++    ){getGridData("ma",l).toggle=-1;}}
          if(id>900   ){for (let l=901;l<=909;l++    ){getGridData("ma",l).toggle=-1;}}
          if(id%100==1){for (let l=101;l<=901;l=l+100){getGridData("ma",l).toggle=-1;}}
          if(id%100==9){for (let l=109;l<=909;l=l+100){getGridData("ma",l).toggle=-1;}}
          for(lx=2;lx<=8;lx++){
            for(ly=200;ly<=800;ly+=100){
              cr_updatesprite(lx+ly)
            }
          }
          data.toggle=!toggle
        }else if (player.cr.selected){
          if (Math.floor(cr_data.nameid[player.cr.selected]/100)==3){
            data.contents=player.cr.selected
          }
        }else{
          data.contents=""
        }
        for (ox=-1;ox<=1;ox+=2){
          cr_updatesprite(id+ox)
        }
        for (oy=-1;oy<=1;oy+=2){
          cr_updatesprite(id+oy*100)
        }
      }
      cr_updatesprite(id)
    },
    getStyle(data,id){
      let style = {
        "background-color": (id%100+(Math.floor(id/100)))%2==1?"#36d106":"#87fa23",
        "border-radius": `${id==202?"10px":"0px"} ${id==208?"10px":"0px"} ${id==808?"10px":"0px"} ${id==802?"10px":"0px"}`,
        "border": "none",
        "background-size": "auto 100%",
        //"image-rendering": "pixelated",
        "background-image": "url(./blank.png)",
        "transition": "background-position 0s"
      }
      let lrside=id%100==1||id%100==9
      let tbside=id<200||id>=900
      if (lrside){
        style.width="20px"
      }
      if (tbside){
        style.height="20px"
      }
      if(tbside||lrside){
        style["background-color"]=data.toggle===-1?"#222222":(data.toggle?"#eb7d34":"#3496eb")
      }else{
        if (data.contents=="responsive cable"){
          style["background-image"]='url("./wire_E.png")'
          let pos=`${-data.wire_sprite*100}% 50%`
          style["background-image"]='url("./wire_E.png")'
          style["background-position"]=pos
        }else if (data.contents=="responsive dust"){
          let pos=`${-data.wire_sprite*100}% 50%`
          style["background-position"]=pos
          style["background-image"]='url("./responsive_dust_E.png")'
        }else if (data.contents=="signal slate"){
          let pos=`${-data.wire_sprite*100}% 50%`
          style["background-position"]=pos
          style["background-image"]='url("./signal_slate_E.png")'
        }else if (data.contents=="logic slate"){
          let pos=`${-data.wire_sprite*100}% 50%`
          style["background-position"]=pos
          style["background-image"]='url("./logic_slate_E.png")'

        }
      }
      if(tbside&&lrside){
        style.display="none"
      }
      return style
    }
  },
  tabFormat: {
    designer: {
      content:[
        "grid",
        ["layer-proxy",["cr",[["grid",[3]]]]]
      ]
    },
    simulator: {
      content:[
        "grid"
      ]
    }
  }
})
