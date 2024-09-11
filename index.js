document.getElementById("add-button").addEventListener("click", function(){
    let newContainer = document.createElement("div");
    newContainer.classList.add('box');
    newContainer.textContent = "Fans";
    document.getElementById("containers").appendChild(newContainer);
});

document.getElementById("add-button").addEventListener("click", function(){
    let newContainer = document.createElement("div");
    newContainer.classList.add('box');
    newContainer.textContent = "Beds";
    document.getElementById("containers").appendChild(newContainer);
});
document.getElementById("add-button").addEventListener("click", function(){
    let newContainer = document.createElement("div");
    newContainer.classList.add('box');
    newContainer.textContent = "Plants";
    document.getElementById("containers").appendChild(newContainer);
});
document.getElementById("add-button").addEventListener("click", function(){
    let newContainer = document.createElement("div");
    newContainer.classList.add('box');
    newContainer.textContent = "Washrooms";
    document.getElementById("containers").appendChild(newContainer);
    document.getElementById('items').appendChild(newItems);
});