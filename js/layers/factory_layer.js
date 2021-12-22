function fa_checkfactory(pos){
  if(!player.fa.factories[pos])player.fa.factories[pos]={}
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
      fa_checkfactory(player.fa.pos)
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
  }
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
      if (player.fa.factories[player.fa.pos][id]){
        style["background-image"]='url("./pipe_E.png")'
        style["background-size"]="auto 100%"
      }
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
        fa_checkfactory(player.fa.pos)
        return player.fa.factories[player.fa.pos][id]||""
      }
    },
    onClick(_,id){
      let prevpos=player.fa.pos
      if (id%100== 1 && player.fa.pos%100> 1)player.fa.pos-=1
      if (id%100==13 && player.fa.pos%100<20)player.fa.pos+=1
      if (Math.floor(id/100)== 1 && Math.floor(player.fa.pos/100)> 1)player.fa.pos-=100
      if (Math.floor(id/100)==13 && Math.floor(player.fa.pos/100)<20)player.fa.pos+=100
      if (prevpos==player.fa.pos){
        player.fa.factories[player.fa.pos][id]="abc"
      }

      fa_checkfactory(player.fa.pos)
      refreshgrid("fa_designer")
      refreshtile("fa_designer",id)
    },
    onHold(data,id){this.onClick(data,id)}
  }
})