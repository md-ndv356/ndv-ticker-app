const menus = Array.from(document.getElementsByClassName("menu-item"));
const buttons = Array.from(document.querySelectorAll(".box button"));
const ChangeMenu = function(){
  for(let menu of menus){ menu.style.display = "none"; }
  let index = event.target.getAttribute("data-index");
  let displayType = "block";
  if(index === "2") displayType = "flex";
  menus[index].style.display = displayType;
};
for(let i=0,l=buttons.length; i<l; i++){
  let button = buttons[i];
  button.setAttribute("data-index", i);
  button.addEventListener("click", ChangeMenu);
}
