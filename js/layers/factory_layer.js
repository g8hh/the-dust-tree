class FA_factory {
  constructor(){
    this.tiles=[]
  }
  create(id,type){
    console.log(`creating ${type} at ${id}`)
    this.tiles[id]=fa_createmachine(type)
  }
  getmachine(id){
    if(!this.tiles[id]){this.create(id,"empty");console.log("created!",id)}
    return this.tiles[id]
  }
  update_io(){
    let outputstring=""
    let checkedtiles=[]
    for (const [pos,machine] of Object.entries(this.tiles)){
      if (machine.name!=="empty"){
        outputstring+=machine.name
      }
    }
  }
}

function fa_createmachine(type){
  if (fa_machinenames[type]){
    return new fa_machinenames[type]()
  }
}

class FA_machine {
  constructor(){

  }
}
class FA_empty extends FA_machine{
  constructor(){
    super()
    this.name="empty"
    this.sprite="./empty.png",
    this.symbol=""
  }
}
class FA_crafter extends FA_machine{
  constructor(){
    super()
    this.name="crafter"
    this.sprite="./crafter_E.png"
    this.symbol="C"
  }
}
class FA_pipe extends FA_machine{
  constructor(){
    super()
    this.name="pipe"
    this.sprite="./pipe_E.png"
    this.symbol="P"+Math.floor(Math.random()*10)
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
        console.log(`fixxed ${pos}`,machine)
        if(machine){
          newfactory.tiles[pos]=fa_createmachine(machine.name)
          for (const [key,value] of Object.entries(machine)){
            newfactory.tiles[pos][key]=value
          }
        }
      }
      getGridData("fa",lx+ly*100).factory=newfactory
    }
  }
}

fa_machinenames={}
for (const [_,machine] of Object.entries([FA_pipe,FA_crafter,FA_empty])){
  fa_machinenames[new machine().name]=machine
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
      worldseed:fa_worldseed //determines tile layout
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
      ]
    },
    designer: {
      content: [
        ["display-text",function(){return player.fa.pos}],
        ["layer-proxy",["fa_designer",[
          "grid"
        ]]]
      ]
    }
  },
  layerShown(){return player.re.upgrades.includes(31)||"ghost"},
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
  grid:{
    rows:13,
    cols:13,
    getStartData(){
      return {}
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
      style["background-size"]="auto 100%"
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
        return machine.symbol
      }
    },
    onClick(_,id){
      let prevpos=player.fa.pos
      if (id%100== 1 && player.fa.pos%100> 1)player.fa.pos-=1
      if (id%100==13 && player.fa.pos%100<20)player.fa.pos+=1
      if (Math.floor(id/100)== 1 && Math.floor(player.fa.pos/100)> 1)player.fa.pos-=100
      if (Math.floor(id/100)==13 && Math.floor(player.fa.pos/100)<20)player.fa.pos+=100
      if (prevpos==player.fa.pos){
        getGridData("fa",player.fa.pos).factory.create(id,"pipe")
      }

      refreshgrid("fa_designer")
      refreshtile("fa_designer",id)
    },
    onRClick(_,id){
      let prevpos=player.fa.pos
      if (id%100== 1 && player.fa.pos%100> 1)player.fa.pos-=1
      if (id%100==13 && player.fa.pos%100<20)player.fa.pos+=1
      if (Math.floor(id/100)== 1 && Math.floor(player.fa.pos/100)> 1)player.fa.pos-=100
      if (Math.floor(id/100)==13 && Math.floor(player.fa.pos/100)<20)player.fa.pos+=100
      if (prevpos==player.fa.pos){
        getGridData("fa",player.fa.pos).factory.create(id,"empty")
      }

      refreshgrid("fa_designer")
      refreshtile("fa_designer",id)
    },
    onHold(data,id){this.onClick(data,id)}
  },
})