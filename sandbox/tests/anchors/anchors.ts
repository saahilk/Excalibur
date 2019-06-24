/// <reference path='../../lib/excalibur.d.ts' />

class Cross extends ex.Actor {
  constructor(x, y) {
    super(x, y, 40, 40);
  }

  onPreDraw(ctx: CanvasRenderingContext2D, delta: number) {
    ctx.beginPath();
    ctx.lineTo(this.width / 2, 0);
    ctx.lineTo(this.width / 2, this.height);
    ctx.strokeStyle = ex.Color.Black.toString();
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.lineTo(0, this.height / 2);
    ctx.lineTo(this.width, this.height / 2);
    ctx.strokeStyle = ex.Color.Black.toString();
    ctx.stroke();
    ctx.closePath();
  }
}

var game = new ex.Engine({ width: 500, height: 500 });
var heartTx = new ex.Texture('../../images/heart.png');
var ldr = new ex.Loader([heartTx]);

game.backgroundColor = ex.Color.White;
game.setAntialiasing(false);

// center anchored actors
var cl = new ex.Label('Centered', 0, 30);
cl.textAlign = ex.TextAlign.Center;
var ca1 = new ex.Actor({ x: 0, y: 0, width: 15, height: 15, color: ex.Color.Red, anchor: ex.Vector.Half });
var ca2 = new ex.Actor({ x: 0, y: 0, width: 10 * 2, height: 10 * 2, color: ex.Color.Green, anchor: ex.Vector.Half });
var ca3 = new ex.Actor({ x: 0, y: 0, width: 10, height: 10, color: ex.Color.Blue, anchor: ex.Vector.Half });
var ca4 = new ex.Actor({ x: 0, y: 0, width: 20 * 2, height: 20 * 2, anchor: ex.Vector.Half });
var heartSprite = heartTx.asSprite();
heartSprite.anchor = ex.Vector.Half;
heartSprite.scale.setTo(3, 3);
ca4.addDrawing(heartSprite);
ca4.rx = 0.5;
ca3.rotation = ex.Util.toRadians(45);

game.add(ca4);
game.add(ca2);
game.add(ca1);
game.add(ca3);
game.add(cl);

// top left anchored actors
var tll = new ex.Label('Top Left', -100, -60);
tll.textAlign = ex.TextAlign.Center;
var tla1 = new ex.Actor({
  x: -100,
  y: -100,
  width: 15,
  height: 15,
  color: ex.Color.Red,
  anchor: ex.Vector.Zero
});
var tla2 = new ex.Actor({
  x: -100,
  y: -100,
  width: 10 * 2,
  height: 10 * 2,
  color: ex.Color.Green,
  anchor: ex.Vector.Zero
});
var tla3 = new ex.Actor({
  x: -100,
  y: -100,
  width: 10,
  height: 10,
  color: ex.Color.Blue,
  anchor: ex.Vector.Zero
});
var tla4 = new ex.Actor({
  x: -100,
  y: -100,
  width: 20 * 2,
  height: 20 * 2,
  anchor: ex.Vector.Zero
});
var heartSprite2 = heartSprite.clone();
heartSprite2.anchor = ex.Vector.Zero;
heartSprite2.scale.setTo(3, 3);
tla4.addDrawing(heartSprite2);
tla3.rotation = ex.Util.toRadians(45);

game.add(tla4);
game.add(tla2);
game.add(tla1);
game.add(tla3);
game.add(tll);

// top right anchored actors
var trl = new ex.Label('Top Right', 100, -60);
trl.textAlign = ex.TextAlign.Center;
var tra1 = new ex.Actor({ x: 100, y: -100, width: 15, height: 15, color: ex.Color.Red, anchor: new ex.Vector(1, 0) });
var tra2 = new ex.Actor({ x: 100, y: -100, width: 10 * 2, height: 10 * 2, color: ex.Color.Green, anchor: new ex.Vector(1, 0) });
var tra3 = new ex.Actor({ x: 100, y: -100, width: 10, height: 10, color: ex.Color.Blue, anchor: new ex.Vector(1, 0) });
var tra4 = new ex.Actor({ x: 100, y: -100, width: 20 * 2, height: 20 * 2, anchor: new ex.Vector(1, 0) });
var heartSprite3 = heartSprite2.clone();
heartSprite3.anchor = ex.Vector.Right;
tra4.addDrawing(heartSprite3);
tra3.rotation = ex.Util.toRadians(45);

game.add(tra4);
game.add(tra2);
game.add(tra1);
game.add(tra3);
game.add(trl);

// bottom left anchored actors
var bll = new ex.Label('Bottom Left', -100, 60);
bll.textAlign = ex.TextAlign.Center;
var bla1 = new ex.Actor({ x: -100, y: 100, width: 15, height: 15, color: ex.Color.Red, anchor: new ex.Vector(0, 1) });
var bla2 = new ex.Actor({ x: -100, y: 100, width: 10 * 2, height: 10 * 2, color: ex.Color.Green, anchor: new ex.Vector(0, 1) });
var bla3 = new ex.Actor({ x: -100, y: 100, width: 10, height: 10, color: ex.Color.Blue, anchor: new ex.Vector(0, 1) });
var bla4 = new ex.Actor({ x: -100, y: 100, width: 20 * 2, height: 20 * 2, anchor: new ex.Vector(0, 1) });
var heartSprite4 = heartSprite3.clone();
heartSprite4.anchor = ex.Vector.Down;
bla4.addDrawing(heartSprite4);
bla3.rotation = ex.Util.toRadians(45);

game.add(bla4);
game.add(bla2);
game.add(bla1);
game.add(bla3);
game.add(bll);

// bottom right anchored actors
var brl = new ex.Label('Bottom Right', 100, 60);
brl.textAlign = ex.TextAlign.Center;
var bra1 = new ex.Actor({ x: 100, y: 100, width: 15, height: 15, color: ex.Color.Red, anchor: new ex.Vector(1, 1) });
var bra2 = new ex.Actor({ x: 100, y: 100, width: 10 * 2, height: 10 * 2, color: ex.Color.Green, anchor: new ex.Vector(1, 1) });
var bra3 = new ex.Actor({ x: 100, y: 100, width: 10, height: 10, color: ex.Color.Blue, anchor: new ex.Vector(1, 1) });
var bra4 = new ex.Actor({ x: 100, y: 100, width: 20 * 2, height: 20 * 2, anchor: new ex.Vector(1, 1) });
var heartSprite5 = heartSprite4.clone();
heartSprite5.anchor = ex.Vector.One;
bra4.addDrawing(heartSprite5);
bra3.rotation = ex.Util.toRadians(45);

game.add(bra4);
game.add(bra2);
game.add(bra1);
game.add(bra3);
game.add(brl);

// markers
var cc = new Cross(0, 0);
var tlc = new Cross(-100, -100);
var trc = new Cross(100, -100);
var blc = new Cross(-100, 100);
var brc = new Cross(100, 100);
game.add(cc);
game.add(tlc);
game.add(trc);
game.add(blc);
game.add(brc);

game.currentScene.camera.x = 0;
game.currentScene.camera.y = 0;
game.start(ldr);

game.input.keyboard.on('down', (evt: ex.Input.KeyEvent) => {
  if (evt.key === ex.Input.Keys.Up) {
    heartSprite.scale.addEqual(new ex.Vector(0.2, 0.2));
    heartSprite2.scale.addEqual(new ex.Vector(0.2, 0.2));
    heartSprite3.scale.addEqual(new ex.Vector(0.2, 0.2));
    heartSprite4.scale.addEqual(new ex.Vector(0.2, 0.2));
    heartSprite5.scale.addEqual(new ex.Vector(0.2, 0.2));
  }
  if (evt.key === ex.Input.Keys.Down) {
    heartSprite.scale.addEqual(new ex.Vector(-0.2, -0.2));
    heartSprite2.scale.addEqual(new ex.Vector(-0.2, -0.2));
    heartSprite3.scale.addEqual(new ex.Vector(-0.2, -0.2));
    heartSprite4.scale.addEqual(new ex.Vector(-0.2, -0.2));
    heartSprite5.scale.addEqual(new ex.Vector(-0.2, -0.2));
  }
  if (evt.key === ex.Input.Keys.Left) {
    ca4.width = ca4.width - 0.2;
  }

  if (evt.key === ex.Input.Keys.Right) {
    ca4.width = ca4.width + 0.2;
  }
});
