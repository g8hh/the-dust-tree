//https://optimistic-snyder-de15e4.netlify.app/
let data={
    name: "crafting", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
      unlocked: true,
      points: new Decimal(0),
      items: {
        packed_dust: new Decimal(0)
      },
      selected: "",
      resources: {
        101:"dust",
        102:"compressed dust",
        103:"dust bricks",
        104:"dust shards"
      },
    }},
    color: "#4BDC13",
    type: "none",
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [],
    buyables: {
      11: {
        cost(x) { return new Decimal(5) },
        display() { return `packed dust x${player.cr.items.packed_dust}\nuse ${this.cost()} dust to produce another.` },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        buy() {
            player[this.layer].points = player[this.layer].points.sub(this.cost())
            let i=player.cr.items
            i.packed_dust=i.packed_dust.add(1)
        },
      },
    },
    clickables: {
      rows:9,
      cols:9,
      11: {
        canClick() {return true},
        onClick() {
          if (player.cr.selected){
            setClickableState(this.layer,this.id,player.cr.selected)
            player.cr.selected=""
          }
        },
        display() {return getClickableState(this.layer,this.id)}
      },
      12: {
        canClick() {return true},
        onClick() {
          if (player.cr.selected){
            setClickableState(this.layer,this.id,player.cr.selected)
            player.cr.selected=""
          }
        },
        display() {return getClickableState(this.layer,this.id)}
      },
      13: {
        canClick() {return true},
        onClick() {},
        display() {return `selected: ${player.cr.selected}`}
      },
    },
    tabFormat: {
      "Main tab": {
          content: ["buyables"],
      },
      "Other tab": {
          content: ["clickables","grid"],
      },
    },
    grid: {
      rows: 7,
      cols: 6,
      getStartData(id) {
          return {amount: new Decimal(0)}
      },
      getUnlocked(id) { // Default
          return true
      },
      getCanClick(data, id) {
          return true
      },
      getStyle(data, id) {
          return {'background-color': data.amount.gt(0)?(player.cr.selected==player.cr.resources[id]?"#AAAAAA":"#888888"):"#222222"}
      },
      onClick(data, id) { // Don't forget onHold
          if (player.cr.resources[id]){
            data.amount=data.amount.add(1)
            select_resource(player.cr.resources[id])
          }
      },
      getTitle(data, id) {
          return player.cr.resources[id]||"none"
      },
      getDisplay(data, id) {
          return data.amount
      },
    },
    layerShown(){return true}
}

function select_resource(button){
  if (player.cr.selected==button){
    player.cr.selected=""
  }else{
    player.cr.selected=button
  }
}

addLayer("cr", data)