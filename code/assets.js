export default function loadAssets() {

  asciistring = " ☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞øε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■";
  
	loadSprite("tos", "sprites/teamdrue.png");
  loadSprite("bg", "sprites/bg.png");
	loadSprite("ghosty", "sprites/ghosty.png");
	loadSprite("spike", "sprites/spike.png");
	loadSprite("grass", "sprites/grass.png");
	loadSprite("prize", "sprites/jumpy.png");
	loadSprite("apple", "sprites/grapes.png");
	loadSprite("portal", "sprites/teamkundebet.png");
  loadSprite("innblikklogo", "sprites/innblikklogo.png");
	loadSprite("coin", "sprites/coin.png");
  loadSprite("gameover", "https://i.giphy.com/media/KwWhqBySq0KPe/giphy-downsized-large.gif");
  loadSprite("winner", "sprites/winner.png")
	loadSound("coin", "sounds/score.mp3");
	loadSound("powerup", "sounds/powerup.mp3");
	loadSound("blip", "sounds/blip.mp3");
	loadSound("hit", "sounds/hit.mp3");
	loadSound("portal", "sounds/portal.mp3");
  loadFont("mccloud", "fonts/drake_10x10.png",10,10,    {chars:asciistring})
 
}