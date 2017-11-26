function math(){
	var target = document.getElementById("para");
        var numOne = prompt("Please enter a number.");
        var numTwo = prompt("Please enter a second number.");
        var pInput = prompt("What would you like to do?\n1.Add\n2.Subtract\n3.Multiply\n4.Divide\n");
        
	switch(Number(pInput))
	{
		case 1:
		       target.innerHTML =numOne + " plus " + numTwo + " equals " + (Number(numOne) + Number(numTwo));
		       break;
		case 2:
		       target.innerHTML = numOne + " minus " + numTwo + " equals " + (Number(numOne) - Number(numTwo)); 
		       break;
		case 3:
                       target.innerHTML = numOne + " times " + numTwo + " equals " + (Number(numOne) * Number(numTwo));
		       break;
		case 4:
		       target.innerHTML = numOne + " divided by " + numTwo + " equals " + (Number(numOne) / Number(numTwo));
		       break;
 		default:
			break;
	}
}

document.getElementById("calculate").onclick=function(){
	math();
}
