//component classes
class MA_component {
  constructor(pos){
    this.pos={x:pos%100-1,y:Math.floor(pos/100)-1}
    this.outbox=[]//all values going out, arranged in the standard 0-3 direction style.
    this._newstate={}//all values in newstate overwrite the values in the current state, useful for queueing changes to the object for the next tick, and all changes also.
  }
  //rotate rotates a value, keeping it within the 0 to 3 range.
  rotate(dir,rot){
    return (dir+rot)%4
  }
  //pulls a value, the dir is rotated 180* so you can do this.neighbor(l).pull(l)
  pull(dir) {
    dir=this.rotate(dir,2)
    if (this.component_type=="responsive dust"){
    }
    let value=this.outbox[dir]
    if(this.on_pull)this.on_pull(dir)
    return value
  }
  //allows you to check data without calling on_pull, if on_pull is unsupplied it is identical, however
  peek(dir) {
    dir=this.rotate(dir,2)
    let value=this.outbox[dir]
    return value
  }
  //fetches the neighbor of an object (can be chained, this.neighbor(1).neighbor(1)...)
  neighbor(dir) {
    let o=cr_orderofchecks[dir]
    let pos_x=this.pos.x+o.x
    let pos_y=this.pos.y+o.y
    let comp=ma_getcomponent(pos_x,pos_y)
    return comp
  }
  //returns a list of all sides with that are ready (or if given a list of sides, only neighbors that are one of those sides)
  ready_neighbor_list(vals) {
    let ready=[]
    if (vals){
      for (let vl=0;vl<vals.length;vl++){
        let l=vals[vl]
        let o=cr_orderofchecks[l]
        if(this.neighbor(l).peek(l)!==undefined){
          ready.push(l)
        }
      }
    }else{
      for (let l=0;l<=3;l++){
        let o=cr_orderofchecks[l]
        if(this.neighbor(l).peek(l)!==undefined){
          ready.push(l)
        }
      }
    }
    return ready
  }
  //returns the number of neighbors that are ready (or if given a list of sides, only neighbors that are one of those sides)
  ready_neighbor_count(vals) {
    let ready=0
    if (vals){
      for (let vl=0;vl<vals.length;vl++){
        let l=vals[vl]
        let o=cr_orderofchecks[l]
        if(this.neighbor(l).peek(l)!==undefined){
          ready++
        }
      }
    }else{
      for (let l=0;l<=3;l++){
        let o=cr_orderofchecks[l]
        if(this.neighbor(l).peek(l)!==undefined){
          ready++
        }
      }
    }
    return ready
  }
  //returns the side of the largest neighboring value, or undefined if there are no neighbors that are ready.
  biggest_neigbor(vals) {
    let lastvalue=-Infinity
    let dir
    if (vals){
      for (let vl=0;vl<vals.length;vl++){
        let l=vals[vl]
        let neighbor_val=this.neighbor(l).peek(l)
        if(neighbor_val!==undefined){
          if (neighbor_val>lastvalue){
            lastvalue=neighbor_val
            dir=l
          }
          if(l==0)console.log(l,dir,neighbor_val,lastvalue)
        }
      }
    }else{
      for (let l=0;l<=3;l++){
        let neighbor_val=this.neighbor(l).peek(l)
        if(neighbor_val!==undefined){
          if (neighbor_val>lastvalue){
            lastvalue=neighbor_val
            dir=l
          }
        }
      }
    }
    return dir
  }
}
class MA_null extends MA_component {
  constructor(pos){
    super(pos)
    this.component_type=""
  }
  title() {
    return ""
  }
  process() {

  }
}
//the ports at the edge of the screen
class MA_port extends MA_component {
  constructor(pos){
    super(pos)
    this.component_type="port"
    this.mode=""
    this.port=0
    this.portindex=0
  }
  clear(){
    switch (this.mode){
      case "I":
        if(this.port>=ma_inputports.length)this.port=ma_inputports.length-1
        break
      case "O":
        if(this.port>=ma_outputports.length)this.port=ma_outputports.length-1
        break
    }
    this.portindex=0
    this.pulled=false
  }
  title(){
    if (this.mode!==""){
      let pr=1-this.cooldown/this.maxcooldown
      return `<div style="
      position:absolute;
      top:    ${pr*100}%;
      bottom:         0%;
      left:           0%;
      right:          0%;
      background-color:#22222244;
      "></div>${this.port} ${
        this.mode=="I"?
        ma_inputports[this.port].index:
        ma_outputports[this.port].index
      }`
      //${this.port}
    }//data.cooldown/data.maxcooldown
  }
  updateoutput(){
    let port=ma_inputports[this.port]
    if (port.index>=port.data.length){ma_cooldown=ma_maxcooldown}
    this.outbox=[]
    this.outbox[this.targport]=port.data[port.index]
  }
  on_pull() {
    if (this.mode=="I"){
      let port=ma_inputports[this.port]
      port.index+=1
      this.updateoutput()//peek end value
      this.pulled=true
      refreshgrid("pg")
    }
  }
  preprocess() {
    if(this.targport===undefined){
      for (let l=0;l<=3;l++){
        if (!this.neighbor(l)){
          this.targport=this.rotate(l,2)
        }
      }
      this.updateoutput()
    }
    this.outbox=[]
    if (this.mode=="I"){
      if (this.pulled){
        this.pulled=false
      }else{
        this.updateoutput()
      }
    }else if (this.mode=="O"){
      if (this.neighbor(this.targport).peek(this.targport)!==undefined){
        let v=this.neighbor(this.targport).pull(this.targport)
        let port=ma_outputports[this.port]
        let exv=port.data[port.index]
        if (exv==v){
          port.index+=1
        }else{
          console.log(exv,v,"fail")
          ma_error_message=`expected ${exv} at ouput ${this.port}, instead got ${v}`
          ma_error_port=this.port
          layers.ma.paused=true
        }
        refreshgrid("pg")
      }
    }

  }
}
//just holds the formatting for the 4 queued numbers at the edge of the tiles.
class MA_slate_base extends MA_component {
  constructor(pos){
    super(pos)
  }
  
  title() {
    return `
    <div style="
    position: absolute;
    right:5%;
    border-radius:10px;
    background-color:#22222244;
    min-width:30px;
    ">${this.outputcache[0]!==undefined?this.outputcache[0]:""}</div>
    <div style="width:100%;justify-content: center;display:flex">
    <div style="
    position: absolute;
    bottom:5%;
    text-align: center;
    border-radius:10px;
    background-color:#22222244;
    min-width:30px;
    ">${this.outputcache[1]!==undefined?this.outputcache[1]:""}</div>
    </div>
    <div style="
    position: absolute;
    left:5%;
    border-radius:10px;
    background-color:#22222244;
    min-width:30px;
    ">${this.outputcache[2]!==undefined?this.outputcache[2]:""}</div>
    <div style="width:100%;justify-content: center;display:flex">
    <div style="
    position: absolute;
    top:5%;
    left: auto;
    right: auto;
    width: auto;
    text-align: center;
    border-radius:10px;
    background-color:#22222244;
    min-width:30px;
    ">${this.outputcache[3]!==undefined?this.outputcache[3]:""}</div>
    </div>
    `
  }
  on_pull(dir) {
    this.outputcache[dir]=undefined
  }
}
class MA_cross_slate extends MA_slate_base {
  constructor(pos){
    super(pos)
    this.component_type="cross slate"
    this.outputcache=[]
    this.lastV=""
  }
  process() {
    for (l=0;l<=3;l++){
      if (this.outputcache[this.rotate(l,2)]==undefined){
        let v=this.neighbor(l).peek(l)
        if (v!==undefined){
          this.neighbor(l).pull(l)
          this.lastV=v
          this.outputcache[this.rotate(l,2)]=v
        }
      }
    }
  }
  postprocess() {
    this._newstate.outbox=[]
    for (l=0;l<=3;l++){
      this._newstate.outbox[l]=this.outputcache[l]
    }
  }
}
class MA_logic_slate extends MA_slate_base {
  constructor(pos){
    super(pos)
    this.component_type="logic slate"
    this.outputcache=[]
  }

  on_pull(dir) {
    this.outputcache[dir]=undefined
  }
  process() {
    if (this.ready_neighbor_count()==2){
      let rd=[]
      let rv=[]
      for (l=0;l<=3;l++){
        if (this.neighbor(l).peek(l)!==undefined){
          rd.push(l)
          rv.push(this.neighbor(l).pull(l))
        }
      }
      if (rd[0]%2==rd[1]%2){//shape | (values directly collide)
        console.log("|")
        for (l=0;l<=1;l++){
          if(this.neighbor(this.rotate(rd[l],1)).component_type!==""){
            this.outputcache[this.rotate(rd[l],1)]=!(rv[0]>0&&rv[1]>0)?1:0
          }
        }
      }else{//shape L (values collide at an angle)
        console.log("L  ")
        for (l=0;l<=1;l++){
          if(this.neighbor(this.rotate(rd[l],2)).component_type!==""){
            this.outputcache[this.rotate(rd[l],2)]=rv[l]-rv[1-l]
          }
        }
      }
    }
  }
  postprocess() {
    this._newstate.outbox=[]
    for (l=0;l<=3;l++){
      this._newstate.outbox[l]=this.outputcache[l]
    }
  }
}
class MA_togglable_slate extends MA_slate_base {
  constructor(pos){
    super(pos)
    this.component_type="togglable slate"
    this.outputcache=[]
  }

  on_pull(dir) {
    this.outputcache[dir]=undefined
  }
  process() {
    if (this.ready_neighbor_count()==2){
      let rd=[]
      let rv=[]
      for (l=0;l<=3;l++){
        if (this.neighbor(l).peek(l)!==undefined){
          rd.push(l)
          rv.push(this.neighbor(l).pull(l))
        }
      }
      if (rd[0]%2==rd[1]%2){//shape | (values directly collide)
      }else{//shape L (values collide at an angle)
        console.log("L  ")
        for (l=0;l<=1;l++){
          if(this.neighbor(this.rotate(rd[l],2)).component_type!==""){
            if(rv[1-l]>0){
              this.outputcache[this.rotate(rd[l],2)]=rv[l]
            }
          }
        }
      }
    }
  }
  postprocess() {
    this._newstate.outbox=[]
    for (l=0;l<=3;l++){
      this._newstate.outbox[l]=this.outputcache[l]
    }
  }
}
class MA_base_dust extends MA_component {
  constructor(pos){
    super(pos)
    this.component_type="dust"
    this.pulled=true
  }
  title() {
    return ""
  }
  on_pull(){
    this._newstate.outbox=[]
    this._newstate.pulled=true
  }
  postprocess(){
    if (this.pulled){
      this.pulled=false
      this.outbox=this.signal
    }else{
    }
  }
}
class MA_responsive_dust extends MA_base_dust {
  constructor(pos){
    super(pos)
    this.component_type="responsive dust"
    this.signal=[1,1,1,1]
  }
}
class MA_dust extends MA_base_dust {
  constructor(pos){
    super(pos)
    this.component_type="dust"
    this.signal=[0,0,0,0]
  }
}
class MA_lively_dust extends MA_base_dust {
  constructor(pos){
    super(pos)
    this.component_type="lively dust"
    this.signal=[-1,-1,-1,-1]
  }
}
class MA_responsive_cable extends MA_component {
  constructor(pos){
    super(pos)
    this.component_type="responsive cable"
  }
  title() {
    return ma_bubble(
      this.heldvalue!==undefined?this.heldvalue:""
    )
  }
  on_pull(dir) {
    //console.log("pulled!",cr_orderofchecks[dir].c)
    this.heldvalue=undefined
    this._newstate.outbox=[]
    this.blocked=-1
  }
  process() {
    if(this.heldvalue!==undefined){
    }else{
      if (this.ready_neighbor_count()>=1){
        let biggest=this.biggest_neigbor()
        if(biggest!==undefined){
          this.heldvalue=this.neighbor(biggest).pull(biggest)
          this.blocked=biggest
        }
      }
    }
  }
  postprocess(){
    this._newstate.outbox=[]
    for (let l=0;l<=3;l++){
      if (l!==this.blocked){
        this._newstate.outbox[l]=this.heldvalue
      }
    }
  }
}

//updates the connected wire sprites
cr_orderofchecks=[
  {x: 1,y: 0,c:">"},
  {x: 0,y: 1,c:"v"},
  {x:-1,y: 0,c:"<"},
  {x: 0,y:-1,c:"^"}
]

function ma_bubble(txt){
  return `
  <div style="width:100%;justify-content: center;display:flex">
  <div style="
  margin-top:35%;
  border-radius:10px;
  background-color:#22222244;
  min-width:30px;
  ">${txt}</div>
  </div>
  `
}


ma_puzzledata={
  101: {
    title: "nand",
    desc: "nand I0 with I1, send to O0",
    inputs: [
      [0,0,1,1],
      [0,1,0,1]
    ],
    outputs: [[1,1,1,0]],
    randomized_test(){},
    rtests_required: 0
  },
  102: {
    title: "sub",
    desc: "subtract I1 from I0, send to O0",
    inputs: [
      [12, 0, -50],
      [ 4, 4,-150]
    ],
    outputs: [[8,-4,100]],
    randomized_test(){
      let a=ma_r(99)
      let b=ma_r(99)
      return {i:[[a],[b]],o:[[a-b]]}
    },
    rtests_required: 47
  },
  103: {
    title: "set to 1",
    desc: "for each I0, send a 1 to O0",
    inputs: [[]],//get pushed to all free wires with a blue io port next to them. (order goes up left right bottom)
    outputs: [[]],//get pulled to fromm all wires with an orange io port next to them. (order goes up left right bottom)
    randomized_test(){
      return {i:[[ma_r(99)]],o:[[1]]}
    },
    rtests_required: 50
  },
  104: {
    title: "add",
    desc: "add I0 to I1, send to O0",
    inputs: [
      [ 4,-8, 4],
      [90, 4,-8]
    ],
    outputs: [[94,-4,-4]],
    randomized_test(){
      let a=ma_r(99)
      let b=ma_r(99)
      return {i:[[a],[b]],o:[[a+b]]}
    },
    rtests_required: 47
  }
}

ma_error_port=0
ma_error_message=""
ma_maxcooldown=20
ma_cooldown=0

ma_inputports=[
  {data:[0,1,0,1],index:0},
  {data:[0,0,1,1],index:0},
]
ma_outputports=[
  {data:[1,1,1,0],index:0},
]

function ma_loadpuzzle(id){
  let puz=ma_puzzledata[id]
  ma_inputports=[]
  for (l=0;l<puz.inputs.length;l++){
    ma_inputports[l]={data:[...puz.inputs[l]],index:0}
  }
  ma_outputports=[]
  for (l=0;l<puz.outputs.length;l++){
    ma_outputports[l]={data:[...puz.outputs[l]],index:0}
  }
  for(let t=0;t<puz.rtests_required;t++){
    let test=puz.randomized_test()
    for (let il=0;il<test.i.length;il++){
      for (let l=0;l<test.i[il].length;l++){
        ma_inputports[il].data.push(test.i[il][l])
      }
    }
    for (let ol=0;ol<test.o.length;ol++){
      for (let l=0;l<test.o[ol].length;l++){
        ma_outputports[ol].data.push(test.o[ol][l])
      }
    }
  }
  ma_refresh_data()
}

//puzzle tiles
{
addLayer("pt",{
  startData(){
    return {
      points: new Decimal(0),
    }
  },
  grid: {
    rows:10,
    cols:10,
    getStartData(){return{}},
    getTitle(_,id){
      if (ma_puzzledata[id]){
        return ma_puzzledata[id].title
      }
    },
    onClick(_,id){
      ma_loadpuzzle(id)
    }
  }
})  
}

//puzzle IO display
{
  function ma_getrow(id){
    let col=id%100-1
    let data
    if (col<ma_inputports.length){
      data=ma_inputports[col]
    }else{
      data=ma_outputports[col-ma_inputports.length]
    }
    return {
      y:Math.floor(id/100)-2,
      offset:data.index,
      data:data.data
    }
  }
  addLayer("pg",{
    startData(){
      return {
        points: new Decimal(0),
      }
    },
    name: "puzzle grid output", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "eror", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#b9bffb",
    type: "none",
    row: 0, // Row the layer is in on the tree (0 is the first row)
    grid: {
      rows: 6,
      cols(){return (ma_inputports.length+ma_outputports.length)},
      getStartData(){
        return {}
      },
      getDisplay(_,id){
        if (Math.floor(id/100)==1){
          return (id%100>ma_inputports.length?id%100-ma_inputports.length:id%100)-1
        }else{
          let values=ma_getrow(id)
          let y=values.y+values.offset
          if (y<values.data.length){
            let v=values.data[y]
            return `${y}: ${v !== undefined ? v : ""}`
          }
        }
      },
      getStyle(_,id){
        let style={
          width: "120px",
          height: "30px",
          "border-radius": "0px"
        }
        if (Math.floor(id/100)==1){
          style["background-color"]=id%100>ma_inputports.length?"#eb7d34":"#3496eb"
        }else{
          let values=ma_getrow(id)
          let row=values.y
          let y=values.y+values.offset
          if (y<values.data.length){
            if (ma_error_message&&(id%100-1==ma_inputports.length+ma_error_port)){
              style["background-color"]="#ff0000"
            }else{
              style["background-color"]=(row%2==0?"#849be4":"#b9bffb")
            }
          }else{
            
            if (ma_error_message&&(id%100-1==ma_inputports.length+ma_error_port)){
              style["background-color"]="#880000"
            }else{
              style["background-color"]="#222222"
            }
          }
        }
        return style
      }
    }
  })
}
  
  
function refreshtile(layer,id){
  let data=getGridData(layer,id)
  setGridData(layer,id,data===false?true:false)//set it to a value it definitely isn't.
  setGridData(layer,id,data)
}

function refreshgrid(layer){
  let rows=layers[layer].grid.rows
  let cols=layers[layer].grid.cols
  rows=typeof rows === "function"?rows():rows
  cols=typeof cols === "function"?cols():cols
  for (let ly=100;ly<=rows*100;ly+=100){
    for(let lx=1;lx<=cols;lx++){
      refreshtile(layer,lx+ly)
    }
  }
}

function cr_updatesprite(id){
  if(id%100<=1||id%100>=9||id<200||id>900){return}
  let spr=0
  let maindata=getGridData("ma",id)
  for (l=0;l<=3;l++){
    let o=cr_orderofchecks[l]
    let data=getGridData("ma",id+o.x+o.y*100)
    if(
      (!maindata.component_type.endsWith("dust")||!data.component_type.endsWith("dust"))&&
      (data.component_type!=="port"||data.mode!=="")
    ){
      spr+=data.component_type!==""?2**(l):0
    }
  }
  getGridData("ma",id).wire_sprite=spr
  refreshtile("ma",id)
}

function ma_r(v){
  return Math.floor(
    (Math.random()*v*2-v+1)
  )
}

function ma_refresh_data(){
  ma_cooldown=0
  for(l=0;l<ma_inputports.length;l++) {ma_inputports[l].index=0}
  for(l=0;l<ma_outputports.length;l++){ma_outputports[l].index=0}
  for(ly=100;ly<=900;ly+=100){
    for(lx=1;lx<=9;lx++){
      let c=getGridData("ma",lx+ly)
      if (c.clear){
        c.clear()
      }else{
        if(c)setGridData("ma",lx+ly,ma_component_make(c.component_type,lx+ly))
      }
    }
  }
  refreshgrid("pg")
}

function ma_component_make(type,id){
  switch (type){
    case "port":
      return new MA_port(id)
    case "responsive dust":
      return new MA_responsive_dust(id)
    case "dust":
      return new MA_dust(id)
    case "lively dust":
      return new MA_lively_dust(id)
    case "cross slate":
      return new MA_cross_slate(id)
    case "logic slate":
      return new MA_logic_slate(id)
    case "responsive cable":
      return new MA_responsive_cable(id)
    case "togglable slate":
      return new MA_togglable_slate(id)
    default:
      return new MA_null(id)
  }
}

function ma_getcomponent(x,y){
  return getGridData("ma",x+y*100+101)
}
function ma_setcomponent(x,y,type){
  let id=x+y*100+101
  if (!(id%100==1||id%100==9||id<200||id>900)){
    setGridData("ma",id,ma_component_make(type,id))
  }
}






addLayer("ma", {
  name: "machine design",
  symbol: "MA",
  startData() {
    return {
      points: new Decimal(0),
      paused:true,
      fastfwd:false,
      ticklength: .5,
      simtime: 0, //time incemented in the update loop by diff, will almost never be above ticklength
    }
  },
  type: "none",
  color: "#ffd541",
  bars: {
    tick: {
        direction: RIGHT,
        width: 500,
        height: 25,
        instant:true,
        progress() {return player.ma.simtime/player.ma.ticklength},
    },
  },
  update: function(diff){
    player.ma.ticklength=1
    player.ma.ticklength*=layers.ma.fastfwd?.1:1
    if(!layers.ma.paused)player.ma.simtime+=diff
    for (;player.ma.simtime>player.ma.ticklength;player.ma.simtime-=player.ma.ticklength){
      if (player.subtabs.ma.mainTabs!=="designer"){
        for(ly=0;ly<=8;ly++){
          for(lx=0;lx<=8;lx++){
            let c=ma_getcomponent(lx,ly)
            if (c.preprocess)c.preprocess()//no pulls or pushes should happen here
          }
        }
        for(ly=0;ly<=8;ly++){
          for(lx=0;lx<=8;lx++){
            let c=ma_getcomponent(lx,ly)
            if (c.process)c.process()
          }
        }
        
        for(ly=0;ly<=8;ly++){
          for(lx=0;lx<=8;lx++){
            let c=ma_getcomponent(lx,ly)
            if (c.postprocess)c.postprocess()
            for ([k,v] of Object.entries(c._newstate)){
              c[k]=v
            }
            c._newstate={}
            refreshtile("ma",lx+ly*100+101)
          }
        }
      }
    }
  },
  clickables:{
    11: {
      title:function(){return layers.ma.paused?"paused":"playing"},
      canClick() {return true},
      onClick(){
        if (ma_error_message){
          ma_error_message=""
          ma_refresh_data()
        }
        layers.ma.paused=!layers.ma.paused
      },
      style() {return{
        "height":"30px"
      }}
    },
    12: {
      title:function(){return layers.ma.fastfwd?"fastforwarded":"normal"},
      canClick() {return true},
      onClick(){
        layers.ma.fastfwd=!layers.ma.fastfwd
      },
      style() {return{
        "height":"30px"
      }}
    },
    13: {
      title:function(){return "clear"},
      canClick() {return true},
      onClick(){
        ma_refresh_data()
      },
      style() {return{
        "height":"30px"
      }}
    }
  },
  grid: {
    rows:9,
    cols:9,
    getStartData(id){
      if (id%100==1||id%100==9||id<200||id>=900){
        return new MA_port(id)
      }else{
        return new MA_null(id)
      }
    },
    getTitle(data,id){
      return data.title?data.title():undefined
    },
    onClick(data,id){
      if (player.subtabs.ma.mainTabs=="designer"){
        
        if ((id%100==1||id%100==9||id<200||id>900)){
          switch (data.mode){
            case "":
              data.mode="I"
              data.port=0
              break
            case "I":
              data.port+=1
              if(data.port>=ma_inputports.length){
                data.port=0
                data.mode="O"
              }
              break
            case "O":
              data.port+=1
              if(data.port>=ma_outputports.length){
                data.port=0
                data.mode=""
              }
              break

          }
          for(lx=2;lx<=8;lx++){
            for(ly=200;ly<=800;ly+=100){
              cr_updatesprite(lx+ly)
            }
          }
        }else{
          if (player.cr.selected){
            if(cr_getitem(player.cr.selected).gt(0)){
              setGridData("ma",id,ma_component_make(player.cr.selected,id))
            }
          }else{
            setGridData("ma",id,ma_component_make("",id))
          }
        }
      }else{
        if (data.held_signal===null){
          for (l=0;l<=3;l++){
            data.outbox=[sigamount,sigamount,sigamount,sigamount]
            data.heldvalue=sigamount
            data.pulleddirs={}
          }
        }else{
          data.outbox=[]
          data.pulleddirs={}
        }
      }
      cr_updatesprite(id)
      for (let l=0;l<=3;l++){
        let o=cr_orderofchecks[l]
        //console.log(l,o.x,o.y,id+o.x+o.y*100)
        cr_updatesprite(id+o.x+o.y*100)
      }
    },
    getStyle(data,id){
      let style = {
        "background-color": (id%100+(Math.floor(id/100)))%2==1?"#112ed1":"#1751e3",
        "border-radius": `${id==202?"10px":"0px"} ${id==208?"10px":"0px"} ${id==808?"10px":"0px"} ${id==802?"10px":"0px"}`,
        "border": "none",
        "background-size": "auto 100%",
        //"image-rendering": "pixelated",
        "background-image": "url(./blank.png)",
        "transition": "all .5s, background-position 0ms, background-size 0ms",
        "-webkit-text-stroke-width": player.subtabs.ma.mainTabs!=="designer"?"0px":"1px",
        "-webkit-text-stroke-color": "black",
        "font-size": "20px",
        "font-weight": "bold",
        "color": player.subtabs.ma.mainTabs!=="designer"?"#df3e23":"#00000000"
      }
      if (player.subtabs.ma.mainTabs=="designer"){
        style["background-color"]=(id%100+(Math.floor(id/100)))%2==1?"#36d106":"#87fa23"
      }
      let lrside=id%100==1||id%100==9
      let tbside=id<200||id>=900
      if (lrside){
        style.width="40px"
      }
      if (tbside){
        style.height="40px"
      }
      if(tbside||lrside){
        style["background-color"]=data.mode==""?"#222222":(data.mode=="O"?"#eb7d34":"#3496eb")
      }else{
        if (data.component_type=="responsive cable"){
          let pos=`${-data.wire_sprite*100}% 50%`
          style["background-position"]=pos
          style["background-image"]='url("./wire_E.png")'
        }else if (data.component_type=="responsive dust"){
          let pos=`${-data.wire_sprite*100}% 50%`
          style["background-position"]=pos
          style["background-image"]='url("./responsive_dust_E.png")'
        }else if (data.component_type=="lively dust"){
          let pos=`${-data.wire_sprite*100}% 50%`
          style["background-position"]=pos
          style["background-image"]='url("./lively_dust_E.png")'
        }else if (data.component_type=="dust"){
          let pos=`${-data.wire_sprite*100}% 50%`
          style["background-position"]=pos
          style["background-image"]='url("./dust_E.png")'
        }else if (data.component_type=="cross slate"){
          let pos=`${-data.wire_sprite*100}% 50%`
          style["background-position"]=pos
          style["background-image"]='url("./cross_slate_E.png")'
        }else if (data.component_type=="togglable slate"){
          style["background-size"]="auto 200%"
          let pos=`${-data.wire_sprite*100}% 00%`
          style["background-position"]=pos
          style["background-image"]='url("./togglable_slate_E.png")'
        }else if (data.component_type=="logic slate"){
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
        ["layer-proxy",["cr",
        [
          ["row",[
            ["grid-tile",[301]],
            ["grid-tile",[101]],
            ["grid-tile",[201]],
          ]],
          ["row",[
            ["grid-tile",[302]],
            ["grid-tile",[303]],
            ["grid-tile",[304]],
            ["grid-tile",[305]],
          ]]
        ]
      ]]
      ]
    },
    simulator: {
      content:[
        "grid",
        ["display-text",function(){return ma_error_message}],
        ["bar",["tick"]],
        ["row",[
          "clickables",
          ["layer-proxy",["pg",
            [
              "grid"
            ]
          ]]
        ]]
      ]
    },
    puzzles: {
      content:[
        ["layer-proxy",["pt",
          [
            "grid"
          ]
        ]]
      ]
    }
  }
})
