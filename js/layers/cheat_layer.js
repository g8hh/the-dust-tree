console.log("started loading cheating!")

time=0

addLayer("ch",{
  getStartData(){
    return{
      unlocked: true,
      points: new Decimal(0),
      item_name: "dust",
      t:0,
    }
  },
  color: "#143464",
  update(diff){
    time+=diff
  },
  row:"side",
  clickables:{
    "finishpuz": {
      title: "finish all puzzles",
      canClick(){return true},
      onClick(){
        for (let [_,puzzle] of Object.entries(ma_puzzledata)){
          player.ma.solved_puzzles[puzzle.title]=true
        }
      },
      style:{
        "border-radius":"10px 10px 10px 10px" 
      },
    },
    "clearitem": {
      title: "clear all resources",
      canClick(){return true},
      onClick(){
        for (let id in cr_data.resources){
          id=Number(id)
          cr_setitem(id,0)
        }
      },
      style:{
        "border-radius":"10px 0px 0px 10px" 
      },
    },
    "add999item": {
      title: "add 999 to all resources",
      canClick(){return true},
      onClick(){
        for (let id in cr_data.resources){
          id=Number(id)
          cr_setitem(id,cr_getitem(id).add(999))
        }
      },
      style:{
        "border-radius":"0px 10px 10px 0px"
      },
    },
    "setitem":{
      canClick(){return true},
      onClick(){
        for (let id in cr_data.resources){
          id=Number(id)
          cr_setitem(id,cr_getitem(id).add(999))
        }
      }
    },

    "clearsel":{
      title: function(){return`0`},
      canClick(){return true},
      onClick(){
        cr_setitem(player.ch.item_name,0)
      },
      style:{
        "border":"none",
        "border-radius":"10px 0px 0px 10px",
        "width":"30px",
        "min-height":"30px",
      },
    },
    "decsel":{
      title: function(){return shiftDown?"-100":"-1"},
      canClick(){return true},
      onClick(){
        cr_subitem(player.ch.item_name,shiftDown?100:1)
      },
      style:{
        "border":"none",
        "border-radius":"0px",
        "width":"30px",
        "min-height":"30px",
        "font-size":function(){return shiftDown?"5px":"10px"},
        "overflow":"hidden",
        "overflow-y": "hidden",
        "padding":"-100px",
        "text-align":"center"
      },
      onHold(){this.onClick()},
    },
    "incsel":{
      title: function(){return shiftDown?"+100":"+1"},
      canClick(){return true},
      onClick(){
        cr_additem(player.ch.item_name,shiftDown?100:1)
      },
      onHold(){this.onClick()},
      style:{
        "border":"none",
        "border-radius":"0px",
        "width":"30px",
        "min-height":"30px",
        "font-size":function(){return shiftDown?"5px":"10px"},
        "overflow":"hidden",
        "overflow-y": "hidden",
        "padding":"-100px",
        "text-align":"center"
      },
    },
    "infinisel":{
      title: function(){return`∞`},
      canClick(){return true},
      onClick(){
        cr_setitem(player.ch.item_name,Infinity)
      },
      onHold(){this.onClick()},
      style:{
        "border":"none",
        "border-radius":"0px 10px 10px 0px",
        "width":"30px",
        "min-height":"30px",
      },
    },
  },
  tabFormat: [
    ["row",[
      ["clickable","finishpuz"],
      ["blank",["10px","10px"]],
      ["clickable","clearitem"],
      ["clickable","add999item"],
    ]],
    ["display-text",function(){return time|0}],
    ["layer-proxy",["cr",[
      function(){
        let tile=cr_getidname(player.ch.item_name)
        tile=Number(cr_data.nameid[tile])
        console.log(tile)
        return ["grid-tile",tile]
      }
    ]]],
    ["blank",["10px","10px"]],
    ["row",[
      ["clickable","clearsel"],
      ["clickable","decsel"],
      ["clickable","incsel"],
      ["clickable","infinisel"],
    ]],
    ["blank",["10px","10px"]],
    ["bad-text-input","player.ch.item_name",{
      "background-color":"#143464",
      "border-radius":"10px 10px 10px 10px",
      "border":"none",
      "width":"200px",
      "height":"30px",
    }]
  ],
})

console.log("cheating loaded!")