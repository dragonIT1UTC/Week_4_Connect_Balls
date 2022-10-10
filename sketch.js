/* Tom tat : 
1. Cac qua bong chuyen dong hon tap trong mot khung canva cho truoc , moi qua bong la mot hinh tron 2D 
2. Mot qua bong duoc dieu khien boi chuot di theo tam qua bong 
- Ta tao 2 qua bong duoc khoi tao boi mang orb và đuoc mo ta so luong ban dau qa bien orbCount , co the tang len 15 hay 20 deu duoc 
- Dong thoi cang tiep xuc voi nhieu qua bong cau truc hinh hoc duoc tao ra cang phong phu 
- Vi du tiep xuc vs 1 qua la duong thang , 2 la tam giac , 3 qua thi no tao ra hinh ve giong nhu tu dien tren mat phang 2D 
- Duong ke mo la duong ke tu hinh chinh den cac hinh khac , con cac hinh duoc tao ngau nhien noi voi nhau boi duong ke trang
- Cac qua bong duoc tao ngau nhien cung co the tiep xuc va tao ra cac net ve phong phu 
3. Ta co the tao ra cac qua bong moi co chuc nang tuong tu bang cach click chuot vao man hinh canva 
4. Mau cua qua bong tao o mot vi tri ngau nhien theo nguyen tac anh xa tu trai qua phai 
5. Viec di chuyen cua cac qua bong cung la ngau nhien theo mot toc do nhat dinh duoc luu trong bien orbRandomMoveSpeed, bien cang lon toc do cang cao 
6. Kha nang lien ket cua cac qua bong o muc do thuong xuyen hay k the hien qua bien orbDispersion , biến càng cao tần suất liên kết càng giảm 
*/

var sketchWidth =  640;
var sketchHeight = 640;
var orbs = [];
var orbCount = 2;
var orbRandomMoveSpeed = 4;
var orbDispersion = 6;
var mouseDetectionSize = 10;
var orbsMoveRandomly = true;
var showDetectionArea = true;
var randomDetectionAreaPerClick = false;

class Orb {
  // Khoi tao 
	constructor(posX, posY, diameter) {
		this.x = posX;
		this.y = posY;
		this.d = diameter;
		this.showDetectionArea = showDetectionArea;
		this.periodOne = random(1,100)*TWO_PI;
		this.periodTwo = random(1,100)*TWO_PI;
	}
	// Xac dinh vung va cham == LEARN "collision mesh simulation" FROM YOU TUBE 
	SetCollisionArea(multiplier) {
		this.colArea = this.d * multiplier;
		if (this.colArea <= this.d) 
			this.colArea = this.d * 2;
	}
	moveTo(x,y,speed) {
		this.x = lerp(this.x, x, speed);
		this.y = lerp(this.y, y, speed);
	}
	
	randomMove(speed, dispersal) {
		var lissaX = cos(radians(this.periodOne));
		var lissaY = sin(radians(this.periodTwo));
		this.x += cos(((frameCount*lissaY)/dispersal))*speed;
		this.y += sin(((frameCount*lissaX)/dispersal))*speed;
	}
	// Nay chi la di chuot theo 
	followMouse() {
		this.x = mouseX;
		this.y = mouseY;
	}
	// Tao mot hinh anh bang anh xa dong thoi to mau cho no 
	render(r,g,b) {
		var da_red = map(this.x,0,sketchWidth,0,255);
		var da_green = map(this.y,0,sketchHeight,0,255);
		var da_blue = map(this.colArea,0,150,0,255);
		fill(da_red,da_green,da_blue,255);
		strokeWeight(0);
		ellipse(this.x, this.y, this.d);
	// Neu no tim thay khu vuc va cham no se tuong tac voi nhau 
		if (this.showDetectionArea) {
			stroke(da_red,da_green,da_blue,80);
			strokeWeight(1);
			fill(da_red,da_green,da_blue,50);
			ellipse(this.x, this.y, this.colArea);
		}
	}
}

function CreateOrb (x, y, diameter, colAreaMultiplier) {
	var orb = new Orb (x,y,diameter);
	orb.SetCollisionArea(colAreaMultiplier);
	return orb;
}
// Cai nay la sinh bong ngau nhien o mot vi tri xac dinh , no duoc push vao va thuc hien ngau nhien o ham 
function SpawnRandomOrbs (amount) {
	for (i = 0; i < amount; i++) {
		orbs.push(CreateOrb(
			random(0,sketchWidth),
			random(0,sketchHeight),
		  10,
			random(7.5,25)
		));
	}
}
// Cac vong tron di chuyen ngau nhien 
function MoveOrbsRandom (amount, speed, dispersal) {
	for (i = 0; i < amount; i++) {
		orbs[i].randomMove(speed, dispersal);
	}
}

function RenderOrbs (amount) {
	for (i = 0; i < amount; i++) {
		orbs[i].render(255,255,255);
	}
}
// Tao hinh khi ket noi 
function ConnectOrbs (amount) {
	for (n = 0; n < amount; n++) {
		for (m = 0; m < amount; m++) {
			var radSquare = orbs[n].colArea*orbs[m].colArea;
			var dx = orbs[n].x - orbs[m].x;
			var dy = orbs[n].y - orbs[m].y;
			var result = (dx*dx)+(dy*dy);
			if (result <= radSquare) {
				stroke(255,255,255);
				strokeWeight(1);
				line(orbs[n].x, orbs[n].y, orbs[m].x, orbs[m].y);
			}
		}
	}
}

function ConnectMouseOrb (amount, mouseOrb) {
	for (i = 0; i < orbCount; i++) {
		var radSquare = orbs[i].colArea*mouseOrb.colArea;
		var dx = orbs[i].x - mouseOrb.x;
		var dy = orbs[i].y - mouseOrb.y;
		var result = (dx*dx)+(dy*dy);
		if (result <= radSquare) {
			stroke(0,255,0);
			strokeWeight(1);
			drawingContext.setLineDash([3,3]);
			line(orbs[i].x, orbs[i].y, mouseOrb.x, mouseOrb.y);
		}
	}
	drawingContext.setLineDash([1]);
}

function AddOrb (orb) {
	orbs.push(orb);
}

var mouseOrb;
function mousePressed () {
	var detectionArea = 0;
	if (randomDetectionAreaPerClick)
		detectionArea = random(7.5,25);
	else
		detectionArea = mouseDetectionSize;
	
	var recordedOrb = CreateOrb(mouseX, mouseY, mouseOrb.d, detectionArea);
	AddOrb(recordedOrb);
	orbCount++;
}

function setup() {
	createCanvas(sketchWidth, sketchHeight);
	background(0);
	mouseOrb = CreateOrb(0,0,10,mouseDetectionSize);
	SpawnRandomOrbs(orbCount);
}

function draw() {
	background(0);
	if (orbCount > 40) {
		while (orbCount > 20) {
			orbCount--;
			orbs.pop();
		}
	}
	mouseOrb.followMouse();
	mouseOrb.render(0,255,0);
	if (orbsMoveRandomly) MoveOrbsRandom(orbCount,orbRandomMoveSpeed, orbDispersion);
	RenderOrbs(orbCount);
	ConnectOrbs(orbCount);
	ConnectMouseOrb(orbCount, mouseOrb);
}