	/*var playerOne=prompt("What is player one's name?\n");
        var playerTwo=prompt("What is player two's name?\n");
	var target = document.getElementById("test");
	target.innerHTML="Player one is " + playerOne + "<br/>player two is " + playerTwo;*/

	var array=[0,1,2,3,4,5,6,7,8];
	var btarget = document.getElementById("board");
	btarget.innerHTML = "<center>" +"| "+ array[0] +" | "+array[1]+ " | "+array[2]+" |"
                           +"<br/>-----------------<br/>"
                           +"| "+array[3]+" | "+array[4]+" | "+array[5]+" |"
                           +"<br/>-----------------<br/>"
			   +"| "+array[6]+" | "+array[7]+" | "+array[8]+"|"+"</center><br/>";
/* function board(playerOne, playerTwo){
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
		    var playerInputOne = prompt(playerOne + " please enter a location\n");
		    var playerOneTurn = parseInt(playerInputOne);
		    array[playerOneTurn] = 'X';   
		    playerTurn++;
		
	            btarget.innerHTML = "| "+ array[0] +" | "+array[1]+ " | "+array[2]+" |"
                           +"<br/>-----------------<br/>"
                           +"| "+array[3]+" | "+array[4]+" | "+array[5]+" |"
                           +"<br/>-----------------<br/>"
			   +"| "+array[6]+" | "+array[7]+" | "+array[8]+" |<br/>";
                } else if((Number(playerTurn) % Number(2)) == Number(1))
		{
		    var playerInputTwo = prompt(playerTwo + " please enter a location:\n");
		    var playerTwoTurn = parseInt(playerInputTwo);   
		    array[playerTwoTurn] = 'O';
		    playerTurn++;
	            btarget.innerHTML = "| "+ array[0] +" | "+array[1]+ " | "+array[2]+" |"
                           +"<br/>-----------------<br/>"
                           +"| "+array[3]+" | "+array[4]+" | "+array[5]+" |"
                           +"<br/>-----------------<br/>"
			   +"| "+array[6]+" | "+array[7]+" | "+array[8]+" |<br/>";
		}
        }



}

document.getElementById("nightMode").onclick=function(){
	document.getElementById("body").style.background.color = "red";

}
*/
function main(){
	//board(playerOne, playerTwo);
}

main();
