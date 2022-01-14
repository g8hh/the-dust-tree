console.log("started loading crafting!")

//https://optimistic-snyder-de15e4.netlify.app/

//https://raw.githack.com/chipsams/The-Modding-Tree/master/index.html

cr_data={
  resources: {
    "a":[
      {name:"empty",c:"#222222"},
    ],
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
    "responsive dustCdust shard":[{a:5,r:"responsive cable"}],
    "responsive cableCengraved bricks":[{a:1,r:"cross slate"}],
    "responsive dustCcross slate":[{a:1,r:"logic slate"}],
    "lively dustCcross slate":[{a:1,r:"togglable slate"}],
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

  craftvolume:1,

  chip_mode:"use",
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
    return ""
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
    if (
      cr_getitem(itemname).gt(button.id==12 && getClickableState(button.layer,11)===itemname?1:0)
    ){
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
            //player.cr.selected=""
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
            //player.cr.selected=""
          }
        },
        display() {return getClickableState(this.layer,this.id)},
        style(){return cr_getcraftstyle(this)}
      },
      13: {
        craftvolume:1,
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
          for (let l=1;l<=player.cr.craftvolume;l++){
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
          }
        },
        onHoldStart(){console.log("start");player.cr.craftvolume=1},
        onHold(){
          console.log(player.cr.craftvolume,layers.re.buyables.extraction.effect())
          this.onClick()
          player.cr.craftvolume+=1
          player.cr.craftvolume=Math.min(player.cr.craftvolume,layers.re.buyables.extraction.effect())
        },
        onHoldStop(){player.cr.craftvolume=1},
        display() {
          let ing1=getClickableState(this.layer,11)
          let ing2=getClickableState(this.layer,12)
          let result=cr_getresult(ing1,ing2)
          if (!result) return "no craftable item"
          let output=""
          for(i in result){
            output+=`${result[i].a*player.cr.craftvolume}x ${result[i].r}\n`
          }
          return output
        }
      },
      14: {
        canClick() {return cr_getitem("recipe chip").gt(0)},
        onClick() {
          player.cr.chip_mode="create"
          player.subtabs.cr.mainTabs="chips"
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
    tabFormat: {
      crafting:{
        content:[
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
      },
      chips:{
        content:[
          ["blank",["100px","100px"]],
          ["layer-proxy",["cr_chips",[
            "grid"
          ]]],
        ]
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
      getCol(id){
        if (cr_data.resources[id]){
          return cr_data.resources[id].c
        }
        return "#222222"
      },
      getStyle(data, id) {
        let col="#000000"
        let is_selected=false
        if (cr_data.resources[id]){
          is_selected=player.cr.selected==cr_data.resources[id].name
        }
        let style={
          "background-color": "#222222",
          "background-size": "auto 100%",
          "padding-bottom": "40%",
          "border-width":"0px",
          "transform-style": "preserve-3d",
        }
        style["background-position"]="0% 0%"
        style["background-image"]='url("./blank.png")'
        if (cr_getobj(id).haveseen){
          style["background-color"]=this.getCol(id)
          if (is_selected){
            style["background-color"]=LightenDarkenColor(this.getCol(id),64)
            style["transform"]="scale(1.1)"
            style["z-index"]="6"
            style["background-size"]= `auto 100%`
          }if (cr_getitem(id).lte(0)){
            style["transform"]="rotatey(180deg)"
          }
          style["background-position"]=`${(id%100+Math.floor(id/100)*9-10)*-100}% 0%`
        }
        for (let text of ["-o-","-ms-","-moz-","-webkit-"]){
          style[text+"transform"]=style["transform"]
          style[text+"transform-style"]=style["transform-style"]
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
          title+=`
          <div style="
          transform-style: preserve-3d;
          position:absolute;
          left: 0%;
          right: 0%;
          top: 0%;
          bottom: 0%;
          ">
          
          <!--zero items image-->
          <div style="
          transform:rotatey(180deg);
          -webkit-backface-visibility: hidden; /* Safari */
          backface-visibility: hidden;
          box-sizing: border-box;
          -moz-box-sizing: border-box;
          -webkit-box-sizing: border-box;
          position:absolute;
          left: 12.5%;
          right: 12.5%;
          top: 12.5%;
          bottom: 12.5%;
          background-image:url(./items_E.png);
          background-size:auto 100%;
          background-position: ${(id%100+Math.floor(id/100)*9-10)*-100}% 0%
          "></div>
          <!--gt zero items image-->
          <div style="
          transform:rotatey(0deg);
          -webkit-backface-visibility: hidden; /* Safari */
          backface-visibility: hidden;
          box-sizing: border-box;
          -moz-box-sizing: border-box;
          -webkit-box-sizing: border-box;
          position:absolute;
          left: 0%;
          right: 0%;
          top: 0%;
          bottom: 0%;
          background-image:url(./items_E.png);
          background-size:auto 100%;
          background-position: ${(id%100+Math.floor(id/100)*9-10)*-100}% 0%
          "></div>

          ${cr_getobj(id).haveseen?`
          <div style="
          transform:rotatey(180deg);
          backface-visibility: hidden;
          position: absolute;
          left: 20%;
          right: 20%;
          bottom: 0%;
          top: auto;
          text-align: center;
          font-size: 20px;
          border-radius: 4px 4px 0% 0%;
          background-color: #22222244;
          color: red;
          ">0</div>
          `:`
          `}

          
          <div style="
          transform:rotatey(180deg);
          backface-visibility: hidden;
          position: absolute;
          right: 5%;
          top:  0%;
          text-align: left;
          border-radius: 0% 0% 4px 4px;
          font-size: 50%;
          color: ${cr_getobj(id).haveseen?"red":"black"};
          padding-top: 2px;
          padding-left: 4px;
          padding-right: 4px;
          background-color: #22222244;
          ">${top_title}</div>
          
          <div style="
          transform:rotatey(0deg);
          backface-visibility: hidden;
          position: absolute;
          left: 5%;
          top:  0%;
          text-align: left;
          border-radius: 0% 0% 4px 4px;
          font-size: 50%;
          color: ${cr_getobj(id).haveseen?"white":"black"};
          padding-top: 2px;
          padding-left: 4px;
          padding-right: 4px;
          background-color: #22222244;
          ">${top_title}</div>

          <div 
          style="
          transform:rotatey(0deg);
          backface-visibility: hidden;
          color: ${cr_getobj(id).haveseen?"white":"black"};
          border-radius: 4px 4px 0% 0%;
          padding-left: 10px;
          padding-right: 10px;
          background-color: #22222244;
          text-align: right;
          font-size: 100%;
          position: absolute;
          right:    5%;
          bottom:   0%;
          height: 17px;
          ">${cr_getitem(id)}</div>
          </div>
          `

          title=title.replaceAll(/transform:(.*?);/g,"-o-$& -ms-$& -moz-$& -webkit-$& $&")
          title=title.replaceAll(/backface-visibility:(.*?);/g,"-o-$& -ms-$& -moz-$& -webkit-$& $&")
          title=title.replaceAll(/transform-style:(.*?);/g,"-o-$& -ms-$& -moz-$& -webkit-$& $&")

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
    layerShown(){return hasUpgrade("re","crafting_unlock") || "ghost"},
    tooltip(){return "manual crafting"}
}

sigamount=0

addLayer("cr", data)


addLayer("cr_chips",{
  name: "crafting",
  color: "#b9bffb",
  type: "none",
  startData(){
    return {
      points: new Decimal(0)
    }
  },
  grid:{
    rows:20,
    cols:3,
    getStartData(){return {ing1:"",ing2:"",empty:true}},
    canClick() {
      return cr_getresult(data.ing1,data.ing2)?true:false
    },
    getStyle(data){
      return {
        "box-shadow":"none",
        "border": "none",
        "background": "transparent",
        "color":"black",
        "width": "200px",
        "height": "100px",
        "border-radius": "0px",
        "margin":"2px",
      }
    },
    onHoldStart(data,id){player.cr.craftvolume=1;player.cr.target_id=id},
    onHold(data,id){
      console.log(player.cr.craftvolume,layers.re.buyables.extraction.effect())
      if(id)clickGrid("cr_chips", id)
      player.cr.craftvolume+=1
      player.cr.craftvolume=Math.min(player.cr.craftvolume,layers.re.buyables.extraction.effect())
    },
    onHoldStop(){player.cr.craftvolume=1},
    onClick(data,id){
      if(player.cr.chip_mode=="create"){
        if(data.empty)cr_subitem("recipe chip",1)
        data.empty=false
        data.ing1=getClickableState("cr",11)
        data.ing2=getClickableState("cr",12)
        player.cr.chip_mode="use"
      }else{
        let ing1=data.ing1
        let ing2=data.ing2
        let result=cr_getresult(ing1,ing2)
        for (let l=1;l<=player.cr.craftvolume;l++){
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
        }
      }
    },
    onRClick(data,id){
      if (!data.empty){
        cr_additem("recipe chip",1)
        setGridData("cr_chips",id,{ing1:"",ing2:"",empty:true})
      }
    },
    getTooltip(data,id){
      let relevant=[]
      if(data){
        relevant[data.ing1]=1
        relevant[data.ing2]=1
        let results=cr_getresult(data.ing1,data.ing2)
        if(results){
          for (let result of results){
            relevant[result.r]=1
          }
        }
      }
      let tooltip=""
      for (let relevantitem in relevant){
        tooltip+=`${relevantitem}:<br>${cr_getitem(relevantitem).toString()}<br>`
      }
      return tooltip
    },
    getTitle(data,id){
      let volume=player.cr.target_id==id?player.cr.craftvolume:1

      let title=""

      let result=cr_getresult(data.ing1,data.ing2)
      let grad="#222222"
      let result_text=""
      if(result){
        grad=cr_getgrad(result)
        for(let item of result){
          result_text+=`${item.r} x${item.a*volume}<br>`
        }
      }else{
        result_text="invalid recipe"
      }

      title+=`<div style="
      border: solid;
      position:absolute;
      height:calc(60% - (12px));
      bottom:3px;
      left:3px;
      right:3px;
      border-radius: 0px 0px 7px 7px;
      padding-left:5px;
      padding-left:5px;
      text-align:left;
      background:${grad};
      ">
        ${result_text}
      </div>`

      
      grad="#222222"
      grad=cr_getgrad([
        {r:cr_getitem(data.ing1).gt(0)?data.ing1:"empty",a:1},
        {r:cr_getitem(data.ing2).gt(data.ing1==data.ing2?1:0)?data.ing2:"empty",a:1}
      ])
      title+=`<div style="
      border-style: solid;
      position:absolute;
      height:40%;
      top:0%;
      left:0%;
      right:0%;
      border-radius: 0px;
      text-align:center;
      background:${grad};
      ">
      <div style="
      color:${data.empty?"black":"white"};
      position:absolute;
      top:calc(0% + 6px);
      left:5%;
      right:5%;
      background-color:#22222244;
      ">
        ${(data.ing1===data.ing2)?
          `${cr_getitem(data.ing1).lt(2)?data.ing1.toUpperCase():data.ing1} x${volume*2}`
        :
          `${cr_getitem(data.ing1).lt(1)?data.ing1.toUpperCase():data.ing1} x${volume} & ${cr_getitem(data.ing2).lt(1)?data.ing2.toUpperCase():data.ing2} x${volume}`
        }
      </div>
      </div>`
      
      return title
    }
  },
})

console.log("crafting loaded!")