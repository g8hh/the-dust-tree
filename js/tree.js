var layoutInfo = {
    startTab: "none",
    startNavTab: "tree-tab",
	showTree: true,

    treeLayout: [
      ["co","blank-co-cr","cr"],
      ["blank","blank","blank","ma"],
      ["blank","blank","fa"]
    ]

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)
addNode("blank-co-cr", {
    layerShown(){return player.co.lifetime_scrounged.gte(50)?"ghost":false},
}, 
)


addLayer("tree-tab", {
    tabFormat: [["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]],
    previousTab: "",
    leftTab: true,
})