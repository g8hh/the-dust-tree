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
      points:new Decimal(0),
      t:0,
      worldseed:fa_worldseed //determines tile layout
    }
  },
  update(diff){
    player[this.layer].t+=diff
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
        data.col=`rgb(0,${n*64+96},${n*64+196})`
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
    }
  },
  
  tabFormat: {
    factory_map: {
      content: [
        ["display-text",function(){return player.fa.worldseed}],
        "grid"
      ]
    }
  }
})