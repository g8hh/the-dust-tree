
addLayer("co",{
  startdust: new Decimal("2e6"),
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
            player.co.scroungeable_dust = player.co.scroungeable_dust.sub(1)
            player.co.lifetime_scrounged = player.co.lifetime_scrounged.add(1)
            cr_additem("dust",1)
          }
      },
      onHold(){this.onClick()},
    },
    44: {
      title: "add 999 to all resources",
      canClick(){return true},
      onClick(){
        player.co.scroungeable_dust = player.co.scroungeable_dust.sub(999)
        player.co.lifetime_scrounged = player.co.lifetime_scrounged.add(999)
        for (let id in cr_data.resources){
          id=Number(id)
          cr_setitem(id,cr_getitem(id).add(999))
        }
      }
    },
  },
  bars: {
    currentdust: {
      direction: UP,
      width:"600",
      height:"900",
      progress(){
        return player.co.scroungeable_dust.div(layers.co.startdust)
      },
      unlocked(){
        return player.co.lifetime_scrounged.gte(10000)
      }
    }
  },
  tabFormat: [
    "clickables",
    ["bar","currentdust"]
  ],
  tooltip(){return "dust collection"+(player.co.lifetime_scrounged.gte(1000)?" overview":"")}
})