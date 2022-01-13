fa_machine_picker={
  1:[
    {name:"pipe"},
    {name:"crafter"},
    {name:"drill"},
    {name:"port"},
  ]
}
for (const [rowi,row] of Object.entries(fa_machine_picker)){
  for (const [i,machine] of Object.entries(row)){
    fa_machine_picker[`${rowi}0${Number(i)+1}`]=machine
  }
}

class FA_network {
  constructor(id){
    this.pipes=[]
    this.inputs=[]
    this.outputs=[]
    this.items=[]
    this.id=id
  }
  getitem(id){
    this.items[id]??=new Decimal(0)
    return this.items[id]
  }
  setitem(id,amount){
    this.items[id]=new Decimal(amount)
  }
  additem(id,amount){
    if(this.items[id]===undefined)this.items[id]=new Decimal(0)
    this.items[id]=this.items[id].add(amount)
  }
  subitem(id,amount){
    if(this.items[id]===undefined)this.items[id]=new Decimal(0)
    this.items[id]=this.items[id].sub(amount)
  }
}

class FA_factory {
  constructor(){
    this.tiles={}
    this.IO=""
    this.networks=[]
  }
  create(id,type){
    this.tiles[id]=fa_createmachine(type,id)
  }
  getmachine(id){
    if(!this.tiles[id])this.create(id,"empty")
    return this.tiles[id]
  }
  update_io(){
    this.recalc_networks()
    for(let l=0;l<100;l++){
      this.tick_sim()
    }
  }
  recalc_networks(){
    let networks=[]
    this.machines=[]
    for (const [pos,machine] of Object.entries(this.tiles)){
      machine.network=null
      machine.networked_sides={}
      machine.recievablefromnetwork={}
    }
    for (const [pos,machine] of Object.entries(this.tiles)){
      if(machine.network_target){
        machine.outputsides=0
        for (let l=0;l<=3;l++){
          if (machine.open(l) && machine.io_port(l+2)){
            machine.outputsides+=1
          }
        }
        this.machines.push(machine)
      }
      if (machine.recursivenetwork && machine.network===null){
        //let network=new FA_network(networks.length+1)
        //machine.recursivenetwork(network)
        //networks.push(network)
      }else if(machine.network_target){
        for (let l=0;l<=3;l++){
          if (machine.open(l) && machine.networked_sides[l]===undefined){
            let network=new FA_network(networks.length+1)
            if (machine.io_port(l+2)=="push"){network.inputs.push(machine)}else{network.outputs.push(machine)}
            machine.network_side(network,l)
            networks.push(network)
          }
        }
      }
    }
    this.IO=networks.length
    this.networks=networks
    refreshgrid("fa_designer")
  }
  tick_sim(){
    for (let machine of this.machines){
      machine.sends={}
      machine.requests=[]
      let recievable={}
      for(let [item,amount] of Object.entries(machine.recievablefromnetwork)){
        recievable[item]??=new Decimal(0)
        recievable[item]=recievable[item].add(amount)
      }
      if (machine.calc_transformation){
        let io=machine.calc_transformation()
        let transforms=new Decimal(io.maxtransforms)
        for (let input of io.inputs){
          recievable[input.r]??=new Decimal(0)
          transforms=transforms.min(recievable[input.r].div(input.a))
        }
        for (let output of io.outputs){
          machine.sends[output.r]=transforms.mul(output.a)
        }

        for (let input of io.inputs){
          machine.requests.push(input.r)
          let runningamount=transforms.mul(input.a)
          for (const [dir,network_id] of Object.entries(machine.networked_sides)){
            if (machine.IO[dir]=="pull"){
              let network=this.networks[network_id-1]
              let removeamount=runningamount.min(network.getitem(input.r))
              network.subitem(input.r,removeamount)
              runningamount.sub(removeamount)
            }
          }
          
        }
      }
      machine.recievablefromnetwork=[]
    }
    for (let network of this.networks){
      for (let input of network.inputs){
        for (let [item,amount] of Object.entries(input.sends)){
          network.additem(item,new Decimal(amount).div(input.outputsides))
        }
      }
    }
    for (let network of this.networks){
      network.requests=[]
      for(let output of network.outputs){
        for(let request of output.requests){
          network.requests[request]??=[]
          network.requests[request].push(output)
        }
      }
      for(let output of network.outputs){
        for(let request of output.requests){
          output.recievablefromnetwork[request]??=new Decimal(0)
          output.recievablefromnetwork[request]=output.recievablefromnetwork[request].add(network.getitem(request).div(network.requests[request].length))
        }
      }
    }
  }
}

function fa_createmachine(type,pos){
  if (fa_machinenames[type]){
    return new fa_machinenames[type](pos)
  }
}

class FA_machine {
  constructor(pos){
    this.pos=pos
    this.IO=["none","none","none","none"]
    this.networked_sides=[]
    this.recievablefromnetwork=[]
    this.outputsides=1
  }
  neighbor(side){
    let o=cr_orderofchecks[side]
    let machine=getGridData("fa",player.fa.pos).factory.getmachine(this.pos+o.x+o.y*100)
    return machine
  }
  open(side){
    if (this.neighbor(side).io_port) {
      return this.neighbor(side).io_port(side)!=="none" && this.IO[side]!=="none"
    }
  }
  io_port(side){
    return this.IO[(side+2)%4]
  }
  get_dir_sprite(){
    let spritepos=0
    for(let l=0;l<=3;l++){
      if (this.open(l)){
        spritepos+=2**l
      }
    }
    return spritepos
  }
  network_side(network,l){
    this.networked_sides[l]=network.id
    if (this.neighbor(l).recursivenetwork){
      if (this.neighbor(l).network===null){
        this.neighbor(l).recursivenetwork(network)
      }
    }
    if (this.neighbor(l).io_port(l)=="pull" && !network.outputs.includes(this.neighbor(l)))network.outputs.push(this.neighbor(l));this.neighbor(l).networked_sides[(l+2)%4]=network.id
    if (this.neighbor(l).io_port(l)=="push" && !network.inputs .includes(this.neighbor(l)))network.inputs .push(this.neighbor(l));this.neighbor(l).networked_sides[(l+2)%4]=network.id
  }
}
class FA_empty extends FA_machine{
  constructor(pos){
    super(pos)
    this.name="empty"
    this.sprite="./empty.png"
    this.spritepos=0
    this.symbol=""
  }
}
class FA_crafter extends FA_machine{
  constructor(pos){
    super(pos)

    this.speed=4000

    this.name="crafter"
    this.sprite="./crafter_E.png"
    this.spritepos=15
    this.symbol="C"

    this.produce="cdst"

    this.network_target=true
  }
  modify_style(style){
    style["background-position"]=`${-this.get_dir_sprite()*100}% 0%`
  }
  config(){
    return [
      {v:"IO",t:"io"},
      {v:"produce",t:"toggle",o:["cdst","brck","shrd","sive","comb"]}
    ]
  }
  calc_transformation(){
    switch (this.produce){
      case "cdst":
        return {
          inputs:[
            {a:2,r:"dust"},
          ],
          outputs:[
            {a:1,r:"compressed dust"},
          ],
          maxtransforms:this.speed
        }
      case "brck":
        return {
          inputs:[
            {a:2,r:"compressed dust"},
          ],
          outputs:[
            {a:1,r:"dust bricks"},
          ],
          maxtransforms:this.speed
        }
      case "shrd":
        return {
          inputs:[
            {a:2,r:"dust bricks"},
          ],
          outputs:[
            {a:1,r:"dust shard"},
          ],
          maxtransforms:this.speed
        }
      case "sive":
        return {
          inputs:[
            {a:1,r:"dust"},
            {a:1,r:"engraved bricks"},
          ],
          outputs:[
            {a:1,r:"responsive dust"},
            {a:1,r:"lively dust"},
            {a:1,r:"engraved bricks"}
          ],
          maxtransforms:this.speed
        }
      case "comb":
        return {
          inputs:[
            {a:1,r:"responsive dust"},
            {a:1,r:"lively dust"},
          ],
          outputs:[
            {a:1,r:"dust"},
          ],
          maxtransforms:this.speed
        }
    }
  }
}
class FA_drill extends FA_machine{
  constructor(pos){
    super(pos)
    this.name="drill"
    this.sprite="./drill_E.png"
    this.spritepos=15
    this.symbol="D"
    this.network_target=true
  }
  modify_style(style){
    style["background-position"]=`${-this.get_dir_sprite()*100}% 0%`
  }
  config(){
    return [
      {v:"IO",t:"io"},
    ]
  }
  calc_transformation(){
    return {
      inputs:[],
      outputs:[
        {a:1,r:"dust"},
      ],
      maxtransforms:1000
    }
  }
}
class FA_pipe extends FA_machine{
  constructor(pos){
    super(pos)
    this.name="pipe"
    this.sprite="./pipe_E.png"
    this.spritepos=0
    this.symbol="P"+Math.floor(Math.random()*10)
    this.IO=["open","open","open","open"]
  }
  modify_style(style){
    style["background-position"]=`${-this.get_dir_sprite()*100}% 0%`
  }
  config(){
    return [
      {v:"network",t:"display-value",ptxt:"<br>network:<br>",dtxt:"none"},
      {v:"IO",t:"block"},
    ]
  }
  recursivenetwork(network){
    network.pipes.push(this)
    this.network=network.id
    let dirsseen=0
    for(let l=0;l<=3;l++){
      if (this.open(l)){
        this.network_side(network,l)
      }
    }
    this.dirsseen=dirsseen
  }
}
class FA_port extends FA_machine{
  constructor(pos){
    super(pos)
    this.name="port"
    this.sprite="./port_E.png"
    this.spritepos=0
    this.symbol="P"+Math.floor(Math.random()*10)
    this.IO=["open","open","open","open"]
    this.mode="push"
    this.network_target=true
  }
  modify_style(style){
    style["background-position"]=`${-this.get_sprite()*100}% 0%`
  }
  config(){
    return [
      {v:"mode",t:"toggle",o:["pull","push"],c:["#249fde","#f9a31b"]},
    ]
  }
  getside(){
    let dirs=[]
    if (this.pos%100==2){dirs.push(0)}
    if (((this.pos/100)|0)==2){dirs.push(1)}
    if (this.pos%100==12){dirs.push(2)}
    if (((this.pos/100)|0)==12){dirs.push(3)}
    if(dirs.length==1)return dirs.pop()
    return 4
  }
  get_sprite(){
    let side=this.getside()
    let spr=this.get_rot_sprite(side)
    if(spr==16)return spr
    spr+=this.mode=="push"?2:0
    
    spr+=this.neighbor(side).io_port(side)=="none"?-1:0
    return spr
  }
  get_rot_sprite(side){
    switch (side){
      case  0: return  1
      case  1: return  5
      case  2: return  9
      case  3: return 13
      default: return 16
    }
  }
  io_port(side){
    return (side+2)%4==this.getside()?this.mode:"none"
  }
}

function fa_fixfactories(){
  for (lx=1;lx<=20;lx++){
    for (ly=1;ly<=20;ly++){
      let factory=getGridData("fa",lx+ly*100).factory
      let newfactory=new FA_factory()
      for (const [key,value] of Object.entries(factory)){
        newfactory[key]=value
      }
      for (const [pos,machine] of Object.entries(newfactory.tiles)){
        if (pos%100<=12){
          if(machine){
            newfactory.tiles[pos]=fa_createmachine(machine.name,pos)
            for (const [key,value] of Object.entries(machine)){
              newfactory.tiles[pos][key]=value
            }
          }
        }
      }
      getGridData("fa",lx+ly*100).factory=newfactory
    }
  }
}

fa_machinenames={}
for (const [_,machine] of Object.entries([FA_pipe,FA_crafter,FA_drill,FA_port,FA_empty])){
  fa_machinenames[new machine().name]=machine
}

function machineconfiglayout(){  
  let configlayout=[]
  if (player.fa.selectedmachine && player.fa.selectedmachine.config){
    let data=player.fa.selectedmachine.config()
    for (const [l,setting] of Object.entries(data)){
      let v="player.fa.selectedmachine."+setting.v
      switch(setting.t){
        case "label":
          configlayout.push(["display-text",setting.v])
          break
        case "display-value":
          configlayout.push(["display-text",`${setting.ptxt}${accessvar(v,setting.dtxt)}`])
          break
        case "slider":
          configlayout.push(["bad-slider",[v,setting.l,setting.u,setting.cb],{"pointer-events":"auto"}])
          break
        case "text":
          configlayout.push(["bad-text-input",v,{"pointer-events":"auto"}])
          break
        case "toggle":
          configlayout.push(["bad-toggle",[v,setting.o,setting.c,setting.cb],{"pointer-events":"auto"}])
          break
        case "io":
          configlayout.push(["4way-bad-toggle",[[v+"[3]",v+"[0]",v+"[2]",v+"[1]"],["none","pull","push"],["#4a5462","#249fde","#f9a31b"],function(){refreshneighbors("fa_designer",player.fa.selectedmachine.pos)}],{"pointer-events":"auto"}])
          break
        case "block":
          configlayout.push(["4way-bad-toggle",[[v+"[3]",v+"[0]",v+"[2]",v+"[1]"],["open","none"],["#14a02e","#4a5462"],function(){refreshneighbors("fa_designer",player.fa.selectedmachine.pos)}],{"pointer-events":"auto"}])
          break
      }
    }
  }
  if (configlayout.length>0){
    configlayout.unshift(["clickable","destroy_selected"])
    configlayout.unshift(["blank",30])
  }
  return configlayout
}

addLayer("fa",{
  name: "factory layer", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "FA", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  color: "#b9bffb",
  type: "none",
  row: 0, // Row the layer is in on the tree (0 is the first row)
  startData(){
    fa_worldseed=Math.random()*1000000
    return {
      factories:{},
      points:new Decimal(0),
      pos:101,
      t:0,
      worldseed:fa_worldseed, //determines tile layout

      toolmode:"destroy",
      selectedmachine:null,

      placemachine:"pipe",
    }
  },
  update(diff){
  },
  grid: {
    rows: 20,
    cols: 20,
    getStartData(id){
      let data={}
      let x=(id%100+.5)/5
      let y=(Math.floor(id/100)+.5)/5
      let n=noise.simplex3(x,y,fa_worldseed)
      if(n>.05){
        data.col="#b9bffb"
        data.tiletype="dust"
      }else{
        data.col=`rgb(0,${n*64+96},${n*64+192})`
        data.tiletype="water"
      }
      data.factory=new FA_factory()
      return data
    },
    getStyle(data,id){
      return {
        width:"30px",
        height:"30px",
        "max-height":"30px",
        "border-radius":"0px",
        "border":"none",
        "margin": "0px",
        "background-color":data.col,
        "overflow": "hidden"
      }
    },
    onClick(data,id){
      player.fa.pos=id
      player.subtabs.fa.mainTabs="designer"
    }
  },
  
  tabFormat: {
    "factory map": {
      content: [
        ["display-text",function(){return player.fa.worldseed}],
        "grid"
      ],
    },
    designer: {
        content: [
          //["display-text",function(){return player.fa.pos}],
          ["layer-proxy",["fa_designer",[
            ["row",[
              "grid",
              ["column",
                [
                  function(){
                    let configlayout = machineconfiglayout()
                    return [
                      "column",
                      configlayout,
                      {
                        "width":configlayout.length>0?`${52+52+20}px`:"20px",
                        "transition":"background-color 1s"
                      }
                    ]
                  }
                ],
                function (){
                  return {
                    "pointer-events": "none",
                    "position":"absolute",
                    "left":`${accessvar("document.getElementById(\"fa_designer_grid\").getBoundingClientRect().left-document.getElementsByClassName(\"layer-tab\")[1].getBoundingClientRect().left",0)+( accessvar("player.fa.selectedmachine.pos",  -100)%100   )*52-10}px`,
                    "top": `${accessvar("document.getElementById(\"fa_designer_grid\").getBoundingClientRect().top -document.getElementsByClassName(\"layer-tab\")[1].getBoundingClientRect().top ",0)+((accessvar("player.fa.selectedmachine.pos",-10000)/100)|0)*52-10}px`,
                    "background-color":"#4a546288",
                    "border-radius":"0px 10px 10px 10px",
                    "padding-top":"20px",
                    "padding-bottom":"20px",
                    "width":"auto",
                    "transition":"width 1s, height 1s",
                    "z-index":"40",
                  }
                }
              ],
            ],
          ],
          ["row",[
            ["raw-html",function() {
              let txt=`networks: ${getGridData("fa", player.fa.pos).factory.IO}<br>`
              for (const network of getGridData("fa",player.fa.pos).factory.networks){
                let requests=""
                for (let [item,requesters] of Object.entries(network.requests||{})){
                  requests+=`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item}: ${requesters.length}<br>`
                }
                let items=""
                for (let [item,amount] of Object.entries(network.items)){
                  items+=`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item}: ${amount.toNumber()}<br>`
                }
                txt+=`
                &nbsp;&nbsp;network ${network.id}:<br>
                &nbsp;&nbsp;&nbsp;&nbsp;pipes: &nbsp; ${`${network.pipes.length}`.padStart(6, '@').replaceAll("@","&nbsp;")}
                &nbsp;inputs: &nbsp;${`${network.inputs.length}`.padStart(6, '@').replaceAll("@","&nbsp;")}
                &nbsp;outputs:      ${`${network.outputs.length}`.padStart(6, '@').replaceAll("@","&nbsp;")}<br>
                &nbsp;&nbsp;&nbsp;&nbsp;requests:<br>${requests}
                &nbsp;&nbsp;&nbsp;&nbsp;items:<br>${items}
                `
              }
              return `<div style="
              text-align:left;
              ">${txt}</div>` 
            }],
          ]],
          ["row",[
            ["clickable","update_io"],
            ["clickable","tick_sim"],
          ]],
          ["row",[
            ["layer-proxy",["fa_machines",[
              ["grid",[1,2,3]]
            ]]],
          ]]
        ]]],
      ]
    }
  },
  layerShown(){return hasUpgrade("re","builder_unlock")||"ghost"},
  tooltip(){return "expand the factory"}
})


//designer
addLayer("fa_designer",{
  name: "factory designer", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "???", // This appears on the layer's node. Default is the id with the first letter capitalized
  color: "#b9bffb",
  type: "none",
  startData(){
    return {
      points:new Decimal(0),
    }
  },
  clickables:{
    "rclicksetting": {
      canClick: true,
      onClick(){player.fa.toolmode=player.fa.toolmode=="config"?"destroy":"config"},
      style(){
        return {
          "background-image":'url("./tools_E.png")',
          "background-size":"auto 100%",
          "background-position":player.fa.toolmode=="destroy"?"100% 0%":"0% 0%"
        }
      }
    },
    "tick_sim": {
      canClick: true,
      onClick(){
        getGridData("fa",player.fa.pos).factory.tick_sim()
      },
      title: "tick sim"
    },
    "update_io": {
      canClick: true,
      onClick(){
        getGridData("fa",player.fa.pos).factory.update_io()
      },
      title: "update io"
    },
    "destroy_selected":{
      canClick(){
        if (player.fa.selectedmachine){
          return player.fa.selectedmachine.name!=="empty"
        }
        return false
      },
      onClick(){
        if (player.fa.selectedmachine){
          getGridData("fa",player.fa.pos).factory.create(player.fa.selectedmachine.pos,"empty")
          refreshneighbors("fa_designer",player.fa.selectedmachine.pos)
          player.fa.selectedmachine=null
        }
      },
      
      style(){
        return {
          "pointer-events":"auto",
          "width":"40px",
          "height":"40px",
          "min-height":"0px",
          "background-image":'url("./tools_E.png")',
          "background-size":"auto 100%",
          "background-position":"100% 0%",
          "position":"absolute",
          "top":"5px",
          "right":"5px",
        }
      }
    }
  },
  grid:{
    rows:13,
    cols:13,
    getStartData(){
      return 0
    },
    getStyle(_,id){
      let machine=getGridData("fa",player.fa.pos).factory.getmachine(id)
      let col
      let x=((id%100-1)/11+(player.fa.pos%100))/5
      let y=(Math.floor(id/100-1)/11+Math.floor(player.fa.pos/100))/5
      let n=noise.simplex3(x,y,player.fa.worldseed)
      if(n>.05){
        col="#b9bffb"
      }else{
        col=rgbToHex(0,snap(n*64+96,16),snap(n*64+192,16))
      }
      let style={
        width:"50px",
        height:"50px",
        "border-radius":"0px",
        "border":"0px",
        "background-color":col,
      }
      style["background-image"]=`url("${machine.sprite}")`
      style["background-size"]="cover"
      style["background-position"]=`${-machine.spritepos*100}% 0%`
      style["transition"]=`all .5s, background-position 1ms`
      if (machine.modify_style) {machine.modify_style(style)}
      return style  
    },
    getTitle(_,id){
      if(
        (id%100== 1            &&player.fa.pos%100== 1)            ||
        (id%100==13            &&player.fa.pos%100==20)            ||
        (Math.floor(id/100)== 1&&Math.floor(player.fa.pos/100)== 1)||
        (Math.floor(id/100)==13&&Math.floor(player.fa.pos/100)==20)
        ){
        return `<div style="
        position:absolute;
        left:  0%;
        top:   0%;
        right: 0%;
        bottom:0%;
        background-color:#222222
        "></div>`
      }else if ((id%100==1)||(id%100==13)||(Math.floor(id/100)==1)||(Math.floor(id/100)==13)){
        return `<div style="
        position:absolute;
        left:  0%;
        top:   0%;
        right: 0%;
        bottom:0%;
        background-color:#22222288
        "></div>`

      }else{
        let machine=getGridData("fa",player.fa.pos).factory.getmachine(id)
        if (machine.network){
          return `[${machine.network}]`
        }
      }
    },
    onClick(_,id){
      let prevpos=player.fa.pos
      if (id%100== 1 && player.fa.pos%100> 1)player.fa.pos-=1
      if (id%100==13 && player.fa.pos%100<20)player.fa.pos+=1
      if (Math.floor(id/100)== 1 && Math.floor(player.fa.pos/100)> 1)player.fa.pos-=100
      if (Math.floor(id/100)==13 && Math.floor(player.fa.pos/100)<20)player.fa.pos+=100
      if (prevpos==player.fa.pos){
        if(getGridData("fa",player.fa.pos).factory.getmachine(id).name==="empty"){
          getGridData("fa",player.fa.pos).factory.create(id,player.fa.placemachine)
        }
      }

      //refreshgrid("fa_designer")
      refreshneighbors("fa_designer",id)
    },
    onRClick(_,id){
      let prevpos=player.fa.pos
      if (id%100== 1 && player.fa.pos%100> 1)player.fa.pos-=1
      if (id%100==13 && player.fa.pos%100<20)player.fa.pos+=1
      if (Math.floor(id/100)== 1 && Math.floor(player.fa.pos/100)> 1)player.fa.pos-=100
      if (Math.floor(id/100)==13 && Math.floor(player.fa.pos/100)<20)player.fa.pos+=100
      if (prevpos==player.fa.pos){
        switch(player.fa.toolmode){
          case "config":
            if(accessvar("player.fa.selectedmachine.pos")===id){
              player.fa.selectedmachine=null
            }else{
              player.fa.selectedmachine=getGridData("fa",player.fa.pos).factory.getmachine(id)
            }
            break
          case "destroy":
            getGridData("fa",player.fa.pos).factory.create(id,"empty")
            if(player.fa.selectedmachine){
              if(player.fa.selectedmachine.pos==id)player.fa.selectedmachine=null
            }
            break
        }
      }

      refreshneighbors("fa_designer",id)
    },
  },
})


//the proxy
fa_machineamountproxy={
  get(target,prop) {
    return prop in target?target[prop]:0
  }
}

//machine storage & crafting
addLayer("fa_machines",{
  startData(){return{
    points:new Decimal(0),
    machineamounts:{},
  }},
  grid: {
    getStartData(){return 0},
    cols: 7,
    rows: 3,
    onClick(_,id){
      if (id==107){
        return layers.fa_designer.clickables.rclicksetting.onClick()
      }
      if (fa_machine_picker[id]){
        player.fa.placemachine=fa_machine_picker[id].name
      }
    },
    getStyle(_,id){
      let style= {
        "background-color":"#b9bffb",
        "width":"70px",
        "height":"70px",
        "min-height":"0px",
        "background-size":"cover",
        "background-position":`-${id%100-1}00% 0%`,
      }
      if (fa_machine_picker[id]){
        style["background-image"]="url('./machines_E.png')"
      }
      if (id==107){
        for (const [k,v] of Object.entries(layers.fa_designer.clickables.rclicksetting.style())){
          style[k]=v
        }
      }
      return style
    },
    getTitle(_,id){
    }
  }
})