<!DOCTYPE html>
<html>
<head>
<style>
div.container {
    width: 100%;
    border: 1px solid gray;
}

.button {
    background-color: black;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
}

.button:hover {
    background-color: #008CBA;
    color: white;
}

header{
    color: white;
    background-color: black;
    clear: left;
    text-align: center;
}

footer {
    padding: 1em;
    color: white;
    background-color: black;
    clear: left;
    text-align: center;
}

nav {
    float: left;
    max-width: 160px;
    margin: 0;
    padding: 1em;
}

nav ul {
    list-style-type: none;
    padding: 0;
}
   
nav ul a {
    text-decoration: none;
}

article {
    margin-left: 170px;
    border-left: 1px solid gray;
    padding: 1em;
    overflow: hidden;
}
</style>
</head>
<script>

  var myDiv = document.getElementById("footer");

  function changeInner1(){
    document.getElementById("leftCol1").innerHTML = "blah";
    myDiv.innerHTML = "Content To Show";
  }

  function changeInner2(){
    document.getElementById("leftCol2").innerHTML = "blah";
    myDiv.innerHTML = "Content To Show";
  }

  function changeInner3(){
    document.getElementById("leftCol3").innerHTML = "blah";
    myDiv.innerHTML = "Content To Show";
  }

  function changeInner4(){
    document.getElementById("leftCol4").innerHTML = "blah";
    myDiv.innerHTML = "Content To Show";
  }

  function changeInner5(){
    document.getElementById("leftCol5").innerHTML = "blah";
    myDiv.innerHTML = "Content To Show";
  }

</script>
<body>

<div class="container">

<header>
   <h1>ASSET</h1>
</header>
  
<!-On button click make an ajax call to update the footer with the appropriate icons !>

<nav>
  <ul>
    <li><a href="#"><button class="button" id="leftCol1" onclick="return changeInner1();">Common Task</button></a></li>
    <li><a href="#"><button class="button" id="leftCol2" onclick="return changeInner2();">Browse All  -- </button></a></li>
    <li><a href="#"><button class="button" id="leftCol3" onclick="return changeInner3();">Fragments -----</button></a></li>
    <li><a href="#"><button class="button" id="leftCol4" onclick="return changeInner4();">Earthcube -----</button></a></li>
    <li><a href="#"><button class="button" id="leftCol5" onclick="return changeInner5();">Blank Canvas</button></a></li>
  </ul>
</nav>

<article>
  <h2> THE POLYMER DRAG/DROP FUNCTIONALITY SHOULD BE HERE
</article>

<footer>REDIRECT LINK RESULT BOX ICONS HERE</footer>

</div>

</body>
</html>


