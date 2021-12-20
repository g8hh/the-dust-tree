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
    if(!comp)console.log("no neighbor???",pos_x,pos_y)
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
          if(l==0)console.log(l,dir,neighbor_val,lastvalue)
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
    return "E"
  }
  process() {

  }
}

class MA_port extends MA_component {
  constructor(pos){
    super(pos)
    this.component_type="port"
  }
  title() {
    return "P"
  }
  process() {

  }
}

class MA_cross_slate extends MA_component {
  constructor(pos){
    super(pos)
    this.component_type="cross slate"
  }
  title() {
    return "C"
  }
  on_pull(dir) {
    this.outbox[dir]=undefined
  }
  process() {
    this._newstate.outbox=[]
    if (this.ready_neighbor_count()>0){
      for (let l=0;l<=3;l++){
        if (this.neighbor(l).peek()!==undefined){
          this._newstate.outbox[this.rotate(l,2)]=this.neighbor(l).pull(l)
        }
      }
    }
  }
}

class MA_responsive_dust extends MA_component {
  constructor(pos){
    super(pos)
    this.component_type="responsive dust"
    
  }
  title() {
    return "D"
  }
  process(){
    this._newstate.outbox=[1,1,1,1]
  }
}

class MA_logic_slate extends MA_component {
  constructor(pos){
    super(pos)
    this.component_type="logic slate"
    this.clearports=[]
    this._newstate.clearports=[]
  }
  title() {return "L"}
  on_pull(dir) {
  }
  process() {
    let out=[]
    if (this.ready_neighbor_count()==2){
      for(l=0;l<=3;l++){
        this.neighbor(l).pull(l)
      }
      for(l=0;l<=3;l++){out[l]=0}
    }
    this._newstate.outbox=out
  }
}


class MA_responsive_cable extends MA_component {
  constructor(pos){
    super(pos)
    console.log("created cable",pos)
    this.component_type="responsive cable"
  }
  title() {
    return (this.heldvalue!==undefined?this.heldvalue:"")
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
        console.log(biggest)
        if(biggest!==undefined){
          this.heldvalue=this.neighbor(biggest).pull(biggest)
          this.blocked=biggest
        }
      }
    }
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
      (maindata.component_type!=="responsive dust")||
      (maindata.component_type=="responsive dust"&&data.component_type!=="responsive dust")
    ){
      spr+=(data.component_type!==""||(0+data.state>0))?2**(l):0
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

ma_puzzledata={
  11: {
    //set to 1
    inputs: [0,94,-12,42],//get pushed to all free wires with a blue io port next to them. (order goes up left right bottom)
    outputs: [1,1,1,1],//get pulled to fromm all wires with an orange io port next to them. (order goes up left right bottom)
    randomized_test(){
      return {i:[ma_r(99)],o:[1]}
    },
    tests_required: 104//includes deterministic outputs
  },
  12: {
    name: "add",
    inputs: [4,90,-8,4,4,-8],
    outputs: [94,-4,-4],
    randomized_test(){
      let a=ma_r(99)
      let b=ma_r(99)
      return {i:[a,b],o:[a+b]}
    },
    tests_required: 104
  }
}

function ma_component_make(type,id){
  switch (type){
    case "responsive dust":
      return new MA_responsive_dust(id)
    case "cross slate":
      return new MA_cross_slate(id)
    case "logic slate":
      return new MA_logic_slate(id)
    case "responsive cable":
      return new MA_responsive_cable(id)
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
  color: "#DBC046",
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
            if (c.process)c.process()
          }
        }
        
        for(ly=0;ly<=8;ly++){
          for(lx=0;lx<=8;lx++){
            let c=ma_getcomponent(lx,ly)
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
        for(ly=100;ly<=900;ly+=100){
          for(lx=1;lx<=9;lx++){
            let c=getGridData("ma",lx+ly)
            if(c)setGridData("ma",lx+ly,ma_component_make(c.component_type,lx+ly))
          }
        }
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
      return data.title?data.title():"?"
    },
    onClick(data,id){
      if (player.subtabs.ma.mainTabs=="designer"){
        
        if ((id%100==1||id%100==9||id<200||id>900)){
          data=(data+1)%3
          for(lx=2;lx<=8;lx++){
            for(ly=200;ly<=800;ly+=100){
              cr_updatesprite(lx+ly)
            }
          }
        }else{
          if (player.cr.selected){
            setGridData("ma",id,ma_component_make(player.cr.selected,id))
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
        "transition": "all .5s, background-position 0ms, background-size 0ms, -webkit-text-stroke-width 2s",
        "-webkit-text-stroke-width": player.subtabs.ma.mainTabs!=="designer"?"0px":"1px",
        "-webkit-text-stroke-color": "black",
        "font-size": "20px",
        "font-weight": "bold",
        "color": player.subtabs.ma.mainTabs!=="designer"?
        ((id%100+(Math.floor(id/100)))%2==0?"#112ed1":"#1751e3"):
        "#00000000"
      }
      if (player.subtabs.ma.mainTabs=="designer"){
        style["background-color"]=(id%100+(Math.floor(id/100)))%2==1?"#36d106":"#87fa23"
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
        style["background-color"]=data.state==0?"#222222":(data.state==2?"#eb7d34":"#3496eb")
      }else{
        if (data.component_type=="responsive cable"){
          let pos=`${-data.wire_sprite*100}% 50%`
          style["background-position"]=pos
          style["background-image"]='url("./wire_E.png")'
        }else if (data.component_type=="responsive dust"){
          let pos=`${-data.wire_sprite*100}% 50%`
          style["background-position"]=pos
          style["background-image"]='url("./responsive_dust_E.png")'
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
        ["layer-proxy",["cr",[["grid",[3]]]]]
      ]
    },
    simulator: {
      content:[
        "grid",
        ["bar",["tick"]],
        "clickables"
      ]
    }
  }
})
