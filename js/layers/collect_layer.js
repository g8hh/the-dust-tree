
addLayer("co",{
  startdust: new Decimal("2e10"),
  startData(){
    return {
      scroungeable_dust: new Decimal(layers.co.startdust),
      points: new Decimal(0),
      lifetime_scrounged: new Decimal(0)
    }
  },
  name: "collecting", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "CO", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  color: "#b9bffb",
  type: "none",
  row: 0, // Row the layer is in on the tree (0 is the first row)
  scrounge(amt){
    amt=new Decimal(amt)
    amt=amt.min(player.co.scroungeable_dust)
    player.co.scroungeable_dust = player.co.scroungeable_dust.sub(amt)
    player.co.lifetime_scrounged = player.co.lifetime_scrounged.add(amt)
    cr_additem("dust",amt)
  },
  hotkeys: [
    {
      key: "d", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
      description: "d: gather dust", // The description of the hotkey that is displayed in the game's How To Play tab
      onPress() { if (layers.co.clickables[11].canClick()){layers.co.clickables[11].onClick()}},
      unlocked() {return hasupgrade("re",41)} // Determines if you can use the hotkey, optional
    }
  ],
  clickables: {
    11: {
      display() { return `
      gather dust
      ${player.co.lifetime_scrounged.gte(200)?(player.co.scroungeable_dust+" renaining\n"):""}
      ${player.co.lifetime_scrounged.gte(1)?(cr_getitem("dust")+" dust in storage.\n"):""}
      ` },
      canClick() { return player.co.scroungeable_dust.gt(0) },
      onClick() {
          if (this.canClick()){
            let amt=new Decimal(layers.re.buyables[11].effect())
            layers.co.scrounge(amt)
          }
      },
      onHold(){this.onClick()},
    },
    44: {
      title: "add 999 to all resources",
      canClick(){return true},
      onClick(){
        for (let id in cr_data.resources){
          id=Number(id)
          cr_setitem(id,cr_getitem(id).add(999))
        }
      }
    },
  },
  tabFormat: [
    ["display-text","(hint: you can hold to rapidly collect dust)"],
    "clickables",
    ["raw-html",function() {
      let height=1000
      let width=200
      return `
      <div style="
      background-color:#b9bffb;
      height:${height}px;
      width:${width}px;
      overflow:hidden;
      border-radius:10px;
      border-width:10px;
      border:solid;
      ">
      <div style="
      background-color:#222222;
      height:${
        (new Decimal(1).sub(player.co.scroungeable_dust.div(layers.co.startdust))).mul(height)
      }px;
      width:${width}px
      ">
      </div>
      </div>
      `
    }]
  ],
  tooltip(){return "dust collection"+(player.co.lifetime_scrounged.gte(1000)?" overview":"")}
})