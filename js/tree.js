var layoutInfo = {
    startTab: "none",
    startNavTab: "tree-tab",
	showTree: true,

    treeLayout: [
      ["co","blank-co-cr","cr"],
      ["fa","blank","re","blank","ma"],
    ]

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)
addNode("blank-co-cr", {
  layerShown(){return hasUpgrade("re","crafting_unlock")?"ghost":false},
}, 
)


addLayer("tree-tab", {
    tabFormat: [["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]],
    previousTab: "",
    leftTab: true,
})