// Load files

for (file of modInfo.modFiles) {
    let script = document.createElement("script");
    console.log(file)
    script.setAttribute("src", "js/" + file);//modInfo.modFiles[file]
    script.setAttribute("async",false)
    document.head.insertBefore(script, document.getElementById("temp"));
}

