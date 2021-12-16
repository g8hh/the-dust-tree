{
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
  let maindata=getGridData("ma",id)
  for (l=0;l<=3;l++){
    let o=cr_orderofchecks[l]
    let data=getGridData("ma",id+o.x+o.y*100)
    if(
      (maindata.contents!=="responsive dust")||
      (maindata.contents=="responsive dust"&&data.contents!=="responsive dust")
    ){
      spr+=data.contents!==""||data.toggle!==-1?2**(l):0
    }
  }
  getGridData("ma",id).wire_sprite=spr
  setGridData("ma",id,getGridData("ma",id))
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
      let search=function(pos,o){
        
      }
      for(ly=200;ly<=800;ly+=100){
        for(lx=2;lx<=8;lx++){
          if (player.subtabs.ma.mainTabs!=="designer"){
            let data=getGridData("ma",lx+ly)
            let detected=[]
            switch (data.contents){
              case "responsive dust":
                for (l=0;l<=3;l++){
                  let o=cr_orderofchecks[l]
                  let pos=lx+ly+o.x+o.y*100
                  update(pos,{pos:pos,value:1})
                }
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
                        value:(!(a&&b))?100:0,
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
                }else if (detected.length>=3){
                  let facx=0
                  let facy=0
                  for (l=0;l<=3;l++){
                    let skip=false
                    let o=cr_orderofchecks[l]
                    let pos=lx+ly+o.x+o.y*100
                    for (l=0;l<detected.length;l++){
                      update(detected[l].pos,null)
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
    getStartData(){
      
      txt=""
      //held signal format
      /*
        {
          value: (regular number),
          pos: (id (202, e.g))
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
      return data.held_signal!==null?data.held_signal.value:""
    },
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
      }else{
        if (data.held_signal===null){
          data.held_signal={value:sigamount,prevpos:101,pos:id}
        }else{
          data.held_signal=null
        }
      }
      cr_updatesprite(id)
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
        "-webkit-text-stroke-width": "1px",
        "-webkit-text-stroke-color": "black",
        "font-size": "20px",
        "font-family": "monospace",
        "color": player.subtabs.ma.mainTabs=="designer"?
        ((id%100+(Math.floor(id/100)))%2==1?"#112ed1":"#1751e3"):
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
        }else if (data.contents=="cross slate"){
          let pos=`${-data.wire_sprite*100}% 50%`
          style["background-position"]=pos
          style["background-image"]='url("./cross_slate_E.png")'
        }else if (data.contents=="togglable slate"){
          style["background-size"]="auto 200%"
          let pos=`${-data.wire_sprite*100}% 00%`
          style["background-position"]=pos
          style["background-image"]='url("./togglable_slate_E.png")'
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
        "grid",
        ["bar",["tick"]],
        "clickables"
      ]
    }
  }
})
