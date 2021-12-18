//component classes
class MA_component {
  constructor(pos){
    this.pos={x:pos%100-1,y:Math.floor(pos/100)-1}
    this.outbox=[]//all values going out, arranged in the standard 0-3 direction style.
  }
  rotate(dir,rot){
    return (dir+rot)%4
  }
  pull(dir) {
    dir=this.rotate(dir,2)
    let value=this.outbox[dir]
    delete this.outbox[dir]
    return value
  }
  peek(dir) {
    dir=this.rotate(dir,2)
    let value=this.outbox[dir]
    return value
  }
  neighbor(dir) {
    let o=cr_orderofchecks[dir]
    return ma_getcomponent(this.pos.x+o.x,this.pos.y+o.y)
  }
  ready_neigbors() {
    let ready=0
    for (l=0;l<=3;l++){
      if(this.neighbor(l).peek(l))ready+=1
    }
    return ready
  }
  biggest_neigbor() {
    let lastvalue=-Infinity
    let dir
    for (l=0;l<=3;l++){
      let neighbor_val=this.neighbor(l).peek(l)
      if(neighbor_val){
        if (neighbor_val>lastvalue){
          lastvalue=neighbor_val
          dir=l
        }
      }
    }
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

class MA_cross_slate extends MA_component {
  constructor(pos){
    super(pos)
    this.component_type="cross slate"
  }
  title() {
    return "C"
  }
  process() {

  }
}

class MA_responsive_cable extends MA_component {
  constructor(pos){
    super(pos)
    console.log("created cable",pos)
    this.component_type="responsive cable"
  }
  title() {
    return "W"+this.heldvalue
  }
  process() {
    if (this.ready_neigbors()>1){
      let biggest=this.biggest_neigbor()
      console.log(biggest)
      this.heldvalue=this.neighbor(biggest).pull(biggest)
      for (l=0;l<=3;l++){
        if (this.neighbor(l).component_type=="" && l!==biggest){
          this.outbox[l]=this.heldvalue
        }
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
  return Math.floor((Math.random()*2-1)*v)
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

function ma_getcomponent(x,y){
  return getGridData("ma",x+y*100+101)
}
function ma_updatetile(id,type){
  if (!(id%100==1||id%100==9||id<200||id>900)){
    switch (type){
      case "cross slate":
        setGridData("ma",id,new MA_cross_slate(id))
        break
      case "responsive cable":
        setGridData("ma",id,new MA_responsive_cable(id))
        break
      default:
        setGridData("ma",id,new MA_null(id))
    }
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
      let updates={}
      let update = function(pos,signal){
        if (signal==null){updates[pos]=null; return true}
        if (updates[pos] && updates[pos]!==null){
          if (updates[pos].value<signal.value){
            updates[pos]=signal
            return true
          }
        }else{
          updates[pos]=signal
          return true
        }
        return false
      }
      if (player.subtabs.ma.mainTabs!=="designer"){
        for(ly=1;ly<=7;ly++){
          for(lx=1;lx<=7;lx++){
            let c=ma_getcomponent(lx,ly)
            c.process()
          }
        }
      }
      //previous update loop
      if(false){
        for(ly=200;ly<=800;ly+=100){
          for(lx=2;lx<=8;lx++){
            if (player.subtabs.ma.mainTabs!=="designer"){
              let data=getGridData("ma",lx+ly)
              let detected=[]
              switch (data.contents){
                case "responsive dust":
                  break
                case "cross slate":
                  for (l=0;l<=3;l++){
                    let o=cr_orderofchecks[l]
                    let pos=lx+ly+o.x+o.y*100
                    let targdata=getGridData("ma",pos)
                    if (targdata.held_signal!==null){
                      if (""+targdata.held_signal.prevpos!==""+(lx+ly)){
                        detected.push({pos:pos,signal:targdata.held_signal,ox:o.x,oy:o.y})
                      }
                    }
                  }
                  for (l=0;l<detected.length;l++){
                    let det=detected[l]
                    
                    let searchdist=1
                    while (searchdist<=7) {
                      let newpos=lx+ly-det.ox*searchdist-det.oy*100*searchdist
                      if (getGridData("ma",newpos).contents=="responsive cable"){
                        if (getGridData("ma",newpos).held_signal===null){
                          update(det.pos,null)
                          update(newpos,{
                            value:det.signal.value,
                            pos:lx+ly-det.ox*(searchdist-1)-det.oy*100*(searchdist-1)
                          })
                        }
                        break
                      }else if (getGridData("ma",newpos).contents=="cross slate"){
                        searchdist+=1
                      }else{
                        break
                      }
                    }
                  }
                  break;
                case "togglable slate":
                  for (l=0;l<=3;l++){
                    let o=cr_orderofchecks[l]
                    let pos=lx+ly+o.x+o.y*100
                    let targdata=getGridData("ma",pos)
                    if (targdata.held_signal!==null){
                      if (""+targdata.held_signal.prevpos!==""+(lx+ly)){
                        detected.push({pos:pos,signal:targdata.held_signal,ox:o.x,oy:o.y})
                      }
                    }
                  }
                  if (detected.length==2){
                    //if its of the form
                    // V
                    //<#>
                    // ^
                    if (detected[0].ox==detected[1].ox||detected[0].oy==detected[1].oy){}
                    //if its of the form
                    // V
                    //>#>
                    // V
                    else{
                      for (l=0;l<=1;l++){
                        let det=detected[l]
                        let newpos=lx+ly+det.oy+det.ox*100
                        update(detected[l].pos,null)
                        if (detected[1-l].signal.value>0){
                          update(lx+ly-detected[l].ox-detected[l].oy*100,{
                            value:detected[l].signal.value,
                            pos: lx+ly,
                          })
                        }
                      }
                    }
                  }
                  break;
                case "logic slate":
                  for (l=0;l<=3;l++){
                    let o=cr_orderofchecks[l]
                    let pos=lx+ly+o.x+o.y*100
                    let targdata=getGridData("ma",pos)
                    if (targdata.held_signal!==null){
                      if (""+targdata.held_signal.prevpos!==""+(lx+ly)){
                        detected.push({pos:pos,signal:targdata.held_signal,ox:o.x,oy:o.y})
                      }
                    }
                  }
                  if (detected.length==2){
                    //if its of the form
                    // V
                    //<#>
                    // ^
                    if (detected[0].ox==detected[1].ox||detected[0].oy==detected[1].oy){
                      for (l=0;l<=1;l++){
                        let det=detected[l]
                        let newpos=lx+ly+det.oy+det.ox*100
                        updates[det.pos]=null
                        let a=detected[0].signal.value>0
                        let b=detected[1].signal.value>0
                        update(newpos,{
                          value:(!(a&&b))?1:0,
                          pos:lx+ly,
                        })
                      }
                    }
                    //if its of the form
                    // V
                    //>#>
                    // V
                    else{
                      for (l=0;l<=1;l++){
                        let det=detected[l]
                        let newpos=lx+ly+det.oy+det.ox*100
                        update(detected[l].pos,null)
                        update(lx+ly-detected[l].ox-detected[l].oy*100,{
                          value:detected[l].signal.value-detected[1-l].signal.value,
                          pos: lx+ly,
                        })
                      }
                    }
                  }
                  break;
                case "responsive cable":
                  if (data.held_signal!==null){
                    //data.held_signal.value+=1
                    let moved=false
                    for (l=0;l<=3;l++){
                      let o=cr_orderofchecks[l]
                      let pos=lx+ly+o.x+o.y*100
                      let targdata=getGridData("ma",pos)
                      if (targdata.held_signal==null && targdata.contents=="responsive cable"){
                        if(""+pos!==""+data.held_signal.prevpos){
                          moved=update(pos,data.held_signal)||moved
                        }
                      }
                    }
                    if (moved) {update(lx+ly,null)}
                  }
              }
            }
          }
        }
      }
      for (const [pos, signal] of Object.entries(updates)) {
        if (signal===null){
          getGridData("ma",pos).held_signal=null
        }else if (getGridData("ma",pos).contents=="responsive cable"){
          getGridData("ma",pos).held_signal={value:signal.value,prevpos:signal.pos,pos:pos}
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
    }
  },
  grid: {
    rows:9,
    cols:9,
    getStartData(id){
      if (id%100==1||id%100==9||id<200||id>=900){
        return 0
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
            ma_updatetile(id,player.cr.selected)
          }else{
            ma_updatetile(id,"")
          }
        }
      }else{
        if (data.held_signal===null){
          for (l=0;l<=3;l++){
            data.outbox=sigamount
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
        console.log(l,o.x,o.y,id+o.x+o.y*100)
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
