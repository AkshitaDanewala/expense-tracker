

var settingbtn = document.querySelector(".settingbtn")
var btnbox = document.querySelector(".btnbox")
var closebtn =  document.querySelector(".closebtn")

settingbtn.addEventListener("click", function(){
    btnbox.style.top = "13%"
})

closebtn.addEventListener("click", function(){
    btnbox.style.top = "-55%"

})