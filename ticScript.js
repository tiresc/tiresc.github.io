function myFunction() {
        document.getElementById("frm1").style.display="none";
	document.getElementById("submit").style.display="none";
    
    var x = document.getElementById("frm1");
    var p1 = "";
   
    p1 += x.elements[0].value ;
    var p2 = "";
    p2 += x.elements[1].value ;
    document.getElementById("demo").innerHTML = "Player One: " + p1 + "<br>Player Two: " + p2;
}

	var array=[0,1,2,3,4,5,6,7,8];
	var btarget = document.getElementById("board");
	btarget.innerHTML = "<center>" +"| "+ array[0] +" | "+array[1]+ " | "+array[2]+" |"
                           +"<br/>-----------------<br/>"
                           +"| "+array[3]+" | "+array[4]+" | "+array[5]+" |"
                           +"<br/>-----------------<br/>"
			   +"| "+array[6]+" | "+array[7]+" | "+array[8]+"|"+"</center><br/>";/*
 function board(p1, p2){
	var array=[0,1,2,3,4,5,6,7,8];
	var btarget = document.getElementById("board");
	btarget.innerHTML = "| "+ array[0] +" | "+array[1]+ " | "+array[2]+" |"
                           +"<br/>-----------------<br/>"
                           +"| "+array[3]+" | "+array[4]+" | "+array[5]+" |"
                           +"<br/>-----------------<br/>"
			   +"| "+array[6]+" | "+array[7]+" | "+array[8]+" |<br/>";
	var playerTurn = Number(0);
	for(i = 0; i <= 8; i++)
        {
   		if((Number(playerTurn) % Number(2)) == Number(0))
		{
		    var playerInputOne = prompt(p1 + " please enter a location\n");
		    var playerOneTurn = parseInt(playerInputOne);
		    array[playerOneTurn] = 'X';   
		    playerTurn++;
		
	            btarget.innerHTML = "| "+ array[0] +" | "+array[1]+ " | "+array[2]+" |"
                           +"<br/>-----------------<br/>"
                           +"| "+array[3]+" | "+array[4]+" | "+array[5]+" |"
                           +"<br/>-----------------<br/>"
			   +"| "+array[6]+" | "+array[7]+" | "+array[8]+" |<br/>";
			winScreen(array);
                } else if((Number(playerTurn) % Number(2)) == Number(1))
		{
		    var playerInputTwo = prompt(p2 + " please enter a location:\n");
		    var playerTwoTurn = parseInt(playerInputTwo);   
		    array[playerTwoTurn] = 'O';
		    playerTurn++;
	            btarget.innerHTML = "| "+ array[0] +" | "+array[1]+ " | "+array[2]+" |"
                           +"<br/>-----------------<br/>"
                           +"| "+array[3]+" | "+array[4]+" | "+array[5]+" |"
                           +"<br/>-----------------<br/>"
			   +"| "+array[6]+" | "+array[7]+" | "+array[8]+" |<br/>";
			winScreen(array);
		}
        }
}
function winScreen(array){  
   //player one win scenarios
	var p = 'X';
        var pp = 'O';
    if((array[0] === p) && (array[1] === p) && (array[2] === p) ||
      (array[0] === p) && (array[3] === p) && (array[6] === p) ||
      (array[0] === p) && (array[4] === p) && (array[8] === p) ||
      (array[1] === p) && (array[4] === p) && (array[7] === p) ||
      (array[2] === p) && (array[5] === p) && (array[8] === p) ||
      (array[2] === p) && (array[4] === p) && (array[6] === p) ||
      (array[3] === p) && (array[4] === p) && (array[5] === p) ||
      (array[6] === p) && (array[7] === p) && (array[8] === p))
   { 
       var t = document.getElementById("win");
	t.innerHTML =  p1 + " won!";
	main();
       //win_splash();
   }
   //player two win scenarios       
   if((array[0] == pp) && (array[1] == pp) && (array[2] == pp) ||
      (array[0] == pp) && (array[3] == pp) && (array[6] == pp) ||
      (array[0] == pp) && (array[4] == pp) && (array[8] == pp) ||
      (array[1] == pp) && (array[4] == pp) && (array[7] == pp) ||
      (array[2] == pp) && (array[5] == pp) && (array[8] == pp) ||
      (array[2] == pp) && (array[4] == pp) && (array[6] == pp) ||
      (array[3] == pp) && (array[4] == pp) && (array[5] == pp) ||
      (array[6] == pp) && (array[7] == pp) && (array[8] == pp))
   { 
       var t = document.getElementById("win");
	t.innerHTML =  p2 + " won!";
	main();
       //win_splash();
   }
}
document.getElementById("nightMode").onclick=function(){
	document.getElementById("body").style.background.color = "red";
}*/

function main(){
	//board(p1, p2);
}

main();
