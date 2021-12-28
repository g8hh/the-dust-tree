
re_researchstyle={
  "width":"200px",
  "min-height":"0px",
  "height":"60px",
  "text-align":"left",
  "border-radius":"1px"
}
addLayer("re",{
  name: "research hub",
  symbol: "RE",
  startData() {
    return {
      points: new Decimal(0),
      paused:true,
      fastfwd:false,
      ticklength: .5,
      simtime: 0, //time incemented in the update loop by diff, will almost never be above ticklength
      inputports: [],
      outputports: [],
      blueprint_name: "blueprint",
    }
  },
  type: "none",
  color: "#ffd541",
  upgrades: {
    11: {
      canAfford(){return cr_getitem("dust").gte(100)},
      fullDisplay:`devise manual crafting aparatus
      <div style="text-align: right">
      &lt;REQ 100 DUST><br>
      &lt;><br>
      &lt;>
      </div>`,
      style: re_researchstyle,
    },
    21: {
      canAfford(){return cr_getitem("logic slate").gte(4)},
      fullDisplay:`devise simulator for logic systems
      <div style="text-align: right">
      &lt;REQ 4 LOGIC SLATE><br>
      &lt;REQ 10 RESPONSIVE CABLE><br>
      &lt;>
      </div>`,
      style: re_researchstyle,
    },
    31: {
      canAfford(){return cr_getitem("dust shard").gte(30)},
      fullDisplay:`devise constuction drone
      <div style="text-align: right">
      &lt;REQ 4 FUNCTIONAL DESIGNS><br>
      &lt;REQ 30 DUST SHARDS><br>
      &lt;>
      </div>`,
      style: re_researchstyle,
    },
  },
  buyables: {
    _11: {
      cost(x){
        return 4**x
      },
      display() { return `ENHANCE\nCURRENT: ${getBuyableAmount(this.layer, this.id)}\n&lt;REQ ${this.cost()} DUST>` },
      canAfford() { return cr_getitem("dust").gte(this.cost()) },
      buy() {
          cr_setitem("dust",cr_getitem("dust").sub(this.cost()))
          setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
      },
      
    }
  },
  layerShown(){return player.co.lifetime_scrounged.gte(50)},
  tooltip(){return "devise new systems"}
})
//cr_getobj("responsive dust").haveseen