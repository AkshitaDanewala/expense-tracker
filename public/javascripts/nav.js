

var menu = document.querySelector(".menu")
var fullpg = document.querySelector(".fullpg")
var closebtn = document.querySelector(".close")

menu.addEventListener("click", function(){
    fullpg.style.top = `0`
})

closebtn.addEventListener("click", function(){
    fullpg.style.top = `-50%`
})