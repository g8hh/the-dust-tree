console.log("started loading research!")

re_researchstyle={
  "width":"200px",
  "min-height":"0px",
  "height":"60px",
  "text-align":"left",
  "border-radius":"1px"
}

re_researchstyle_blank={...re_researchstyle}
re_researchstyle_blank["background-color"]="#00000000"
re_researchstyle_blank["border"]="none"
re_researchstyle_blank["pointer-events"]="none"
re_researchstyle_blank_flat={...re_researchstyle_blank}
re_researchstyle_blank_flat.height="30px"
re_researchstyle_marker={...re_researchstyle_blank}

re_upgrades={
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
    branches:[
      ["circuit_unlock","#24523b"],
    ],
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
    branches:[
      ["builder_unlock","#24523b"],
    ],
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
    branches:[
      ["blank_0_1","#24523b"],
    ],
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
    style: re_researchstyle_blank,
    fullDisplay(){return ""},
  },
  blank_flat: {
    canAfford: false,
    style: re_researchstyle_blank_flat,
    fullDisplay(){return ""},
  }
}

for (let l=0;l<=11;l++){re_upgrades[`blank_${(l/3)|0}_${l%3}`]={
  branches: [
    [`blank_${(l/3)|0}_0`,"#24523b"],
    [`blank_${(l/3)|0}_1`,"#24523b"],
    [`blank_${(l/3)|0}_2`,"#24523b"],
  ],
  fullDisplay(){return ""},
  canAfford: false,
  style: re_researchstyle_marker
}}

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
  upgrades: re_upgrades,
  buyables: {
    extraction: {
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
        return (x||getBuyableAmount(this.layer, this.id)).add(1).toNumber()**2
      },
      style:re_researchstyle,
      
    },
    crafting: {
      costs:[
        {i:"compressed dust",a:40},
        {i:"lively dust",a:100},
        {i:"recipe chip",a:30}
      ],
      cost(x){
        return this.costs[x]||{i:"unknown",a:Infinity}
      },
      display() {
        let amt=getBuyableAmount(this.layer, this.id)
        return `ENHANCE BULK CRAFTING
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
        return (x||getBuyableAmount(this.layer, this.id)).add(1).toNumber()**2
      },
      style:re_researchstyle,
      
    }
  },
  tabFormat: [
    ["display-text","devise new systems to allow for advanced collection and usage."],
    ["row",[
      ["buyable","extraction"],
      ["blank",["20px",1]],
      ["buyable","crafting"],
    ]],
    ["blank",["20px","20px"]],
    ["upgrade-tree",[
      ["crafting_unlock","blank"     ],
      ["blank_0_0","blank_0_1"],
      ["circuit_unlock" ,"dusthotkey"],
      ["blank_flat"],
      ["builder_unlock" ,"blank"     ],
    ]]
  ],
  layerShown(){return player.co.lifetime_scrounged.gte(50)},
  tooltip(){return "devise new systems"}
})
//cr_getobj("responsive dust").haveseen

console.log("research loaded!")