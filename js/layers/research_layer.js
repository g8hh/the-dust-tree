
re_researchstyle={
  "width":"200px",
  "min-height":"0px",
  "height":"60px",
  "text-align":"left",
  "border-radius":"1px"
}

re_researchstyle_blank={...re_researchstyle}
re_researchstyle_blank.opacity="0"

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
    crafting_unlock: {
      canAfford(){return cr_getitem("dust").gte(100)},
      fullDisplay:`devise manual crafting aparatus
      <div style="text-align: right">
      &lt;REQ 100 DUST><br>
      &lt;USE 30 DUST><br>
      &lt;>
      </div>`,
      pay(){cr_subitem("dust",30)},
      style: re_researchstyle,
    },
    circuit_unlock: {
      canAfford(){return cr_hasitem("logic slate",4) && cr_hasitem("responsive cable",10)},
      fullDisplay:`devise simulator for logic systems
      <div style="text-align: right">
      &lt;REQ 4 LOGIC SLATE><br>
      &lt;USE 10 RESPONSIVE CABLE><br>
      &lt;>
      </div>`,
      pay(){cr_subitem("responsive cable",10)},
      style: re_researchstyle,
    },
    builder_unlock: {
      canAfford(){return cr_hasitem("dust shard",30) && cr_hasitem("lively dust",10) && Object.keys(player.ma.solved_puzzles).length>=6},
      fullDisplay:`devise constuction drone
      <div style="text-align: right">
      &lt;REQ 6 FUNCTIONAL DESIGNS><br>
      &lt;USE 30 DUST SHARDS><br>
      &lt;USE 10 LIVELY DUST>
      </div>`,
      pay(){cr_subitem("dust shards",30);cr_subitem("lively dust",10)},
      style: re_researchstyle,
    },
    dusthotkey: {
      canAfford(){return cr_hasitem("dust",200) && cr_hasitem("engraved bricks",30)},
      fullDisplay:`devise hotkey for dust collection
      <div style="text-align: right">
      &lt;USE 200 DUST><br>
      &lt;USE 30 ENGRAVED BRICKS><br>
      &lt;>
      </div>`,
      pay(){cr_subitem("dust",200);cr_subitem("engraved bricks",30)},
      style: re_researchstyle,
    },
    blank: {
      canAfford: false,
      style: re_researchstyle_blank
    }
  },
  buyables: {
    extraction_efficiency: {
      costs:[
        {i:"dust",a:40},
        {i:"compressed dust",a:40},
        {i:"dust bricks",a:40}
      ],
      cost(x){
        return this.costs[x]||{i:"unknown",a:Infinity}
      },
      display() {
        let amt=getBuyableAmount(this.layer, this.id)
        return `ENHANCE GATHERING
        CURRENT: ${amt}
        &lt;USE ${`${this.cost().a}`.toUpperCase()} ${this.cost().i.toUpperCase()}>
        EFFECT: x${this.effect()}`
      },
      canAfford() { return cr_getitem(this.cost().i).gte(this.cost().a) },
      buy() {
          cr_setitem(this.cost().i,cr_getitem(this.cost().i).sub(this.cost().a))
          setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
      },
      effect(x){
        return (x||getBuyableAmount(this.layer, this.id))**3
      },
      style:re_researchstyle,
      
    }
  },
  tabFormat: [
    ["display-text","devise new systems to allow for advanced collection and usage."],
    ["buyable",11],
    ["row",[
      ["upgrade-tree",[
        ["crafting_unlock","dusthotkey"],
        ["circuit_unlock" ,"blank"     ],
        ["builder_unlock" ,"blank"     ],
      ]]
    ]]
  ],
  layerShown(){return player.co.lifetime_scrounged.gte(50)},
  tooltip(){return "devise new systems"}
})
//cr_getobj("responsive dust").haveseen