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
    this.cooldown=0
    this.maxcooldown=15
  }
  clear(){
    this.portindex=0
    this.cooldown=0
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
      "></div>${this.port}`
      //${this.port}
    }//data.cooldown/data.maxcooldown
  }
  updateoutput(){
    if (this.portindex>=ma_inputports[this.port].length&&this.cooldown<=0){this.cooldown=this.maxcooldown}
    this.outbox=[]
    this.outbox[this.targport]=ma_inputports[this.port][this.portindex]
  }
  on_pull() {
    if (this.mode=="I"){
      this.portindex+=1
      this.updateoutput()//peek end value
      this.pulled=true
    }
  }
  preprocess() {
    if (this.cooldown>0){
      this.cooldown-=1
      if(this.cooldown<=0){
        this.portindex=0
      }
    }
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
        let exv=ma_outputports[this.port][this.portindex]
        if (exv==v){
          this.portindex+=1
        }else{
          console.log(exv,v,"fail")
          layers.ma.error_message=`expected ${exv} at ouput ${this.port}, instead got ${v}`
          layers.ma.paused=true
        }
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
  11: {
    //set to 1
    inputs: [
      [0,94,-12,42]
    ],//get pushed to all free wires with a blue io port next to them. (order goes up left right bottom)
    outputs: [
      [1,1,1,1]
    ],//get pulled to fromm all wires with an orange io port next to them. (order goes up left right bottom)
    randomized_test(){
      return {i:[ma_r(99)],o:[1]}
    },
    tests_required: 104//includes deterministic outputs
  },
  12: {
    name: "add",
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
    tests_required: 103
  }
}

ma_inputports=[
  [0,1,0,1],
  [0,0,1,1]
]
ma_outputports=[
  [1,1,1,0]
]

function ma_loadpuzzle(){

}


function refreshtile(layer,id){
  let data=getGridData(layer,id)
  setGridData(layer,id,data===false?true:false)//set it to a value it definitely isn't.
  setGridData(layer,id,data)
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
        if (layers.ma.error_message){
          layers.ma.error_message=""
          ma_refresh_data()
        }
        layers.ma.paused=!layers.ma.paused
      }
    },
    12: {
      title:function(){return layers.ma.fastfwd?"fastforwarded":"normal"},
      canClick() {return true},
      onClick(){
        layers.ma.fastfwd=!layers.ma.fastfwd
      }
    },
    13: {
      title:function(){return "clear"},
      canClick() {return true},
      onClick(){
        ma_refresh_data()
      }
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
        ["display-text",function(){return layers.ma.error_message}],
        ["bar",["tick"]],
        "clickables"
      ]
    }
  }
})
