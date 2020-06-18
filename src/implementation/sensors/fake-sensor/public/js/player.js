var url = "http://localhost:3001";

function getGestureSet() {
    fetch(url + "/gesture-set", {
        method: 'GET'
    }).then((res) => {
        return res.json();
    }).then((jsonData) => {
        var gestureset = jsonData["gestureset"];
        displayGestureSet(gestureset);
    }).catch((err) => {
        console.log(JSON.stringify(err));
    })
}

function displayGestureSet(gestureset) {
    // Remove all child elements
    const containerNode = document.getElementById("gestureList");
    while (containerNode.firstChild) {
        containerNode.removeChild(containerNode.firstChild);
    }

    // Add new child elements
    if (gestureset.length == 0) {
        containerNode.innerHTML += getNoResultHtml();
    } else {
        for (var i = 0; i < gestureset.length; i++) {
            containerNode.innerHTML += getGestureSetHtml(gestureset[i]);
        }
    }
}

function getNoResultHtml() {
    var text = "No gesture";
    return `<button type="button" id="noFile" class="list-group-item list-group-item-action" disabled>${text}</button>`;
}

function getGestureSetHtml(gesturename) {
    var id = `${gesturename}`;
    return `<button type="button" id="${id}" class="list-group-item list-group-item-action" onclick="playGesture(this.id)">${gesturename}</button>`;
}

function playGesture(nodeId) {
    var selectedNode = document.getElementById(nodeId);
    var newSelectedFile = selectedNode.innerText;
    fetch(url + "/play/" + newSelectedFile, {
        method: 'POST'
    }).then((res) => {
        console.log("done");
    }).catch((err) => {
        console.log(JSON.stringify(err));
    })
}