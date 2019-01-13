<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="styles.css">
<title>TESTING</title></head>
<body>
<h1>LED CONTROL</h1>
<?php 


echo "<br><br>";

function ledOn(){
system("cd /usr/lib/cgi-bin && sudo ./control ledon");
}

function ledOff() {
system("cd /usr/lib/cgi-bin && sudo ./control ledoff");

}
function servoRight() {
system("cd /usr/lib/cgi-bin && sudo python servo.py right");

}
function servoLeft() {
system("cd /usr/lib/cgi-bin && sudo python servo.py left");

}
    if (isset($_GET['ledoff'])) {
               ledOff();
                  }

    if (isset($_GET['ledon'])) {
               ledOn();
                  }
    if (isset($_GET['servoRight'])) {
               servoRight();
                  }
    if (isset($_GET['servoLeft'])) {
               servoLeft();
                  }

?>
    <a href='iot.php?ledon=true' class="button">ON</a>
   <a href='iot.php?ledoff=true'class="button">OFF</a>
<br><br><br><br>
<h1> Servo Control</h1>
    <a href='iot.php?servoRight=true' class="button">Servo Right</a>
   <a href='iot.php?servoLeft=true'class="button">Servo Left</a>
<a href="index.php">main</a>
</body>
