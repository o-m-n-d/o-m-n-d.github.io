const bg = ( backdrop ) => {

  backdrop.setup = () => {
    backdrop.createCanvas(backdrop.windowWidth, backdrop.windowHeight);
    backdrop.pageLines();
  };

  backdrop.pageLines = () => {
    backdrop.background(255);
    backdrop.stroke(75, 150, 225, 255);
    backdrop.strokeWeight(0.2);
    for (let i = 0; i < backdrop.height; i += 25) {
      backdrop.line(0, i, backdrop.width, i);
    }
  };

  backdrop.windowResized = () => {
    backdrop.resizeCanvas(backdrop.windowWidth, backdrop.windowHeight);
    backdrop.pageLines();
  };
};
let cnv1 = new p5(bg);

const fg = ( main ) => {

  let micStarted = false;
  let blankPage = true;

  let mic, fft;

  let cnv, cnvW, cnvH, cnvX, cnvY, area;

  let x, y, targetX, targetY;
  
  let lvl = {
    mic: 0,
    norm: 0
  };
  
  let spectrum = {
    analysis: [],
    wm: 0
  };

  let noiseScale = 0.001;

  let sw = {
    level: 0,
    max: 0
  };

  let a = {
    level: 255,
    amt: 1.0,
    offset: 150
  };

  main.preload = () => {
    let font = main.loadFont('QEScottWilliams.ttf');
  };

  main.scaleCanvas = () => {
    cnvW = (main.round(main.windowWidth / 100) * 100) - 100;
    cnvH = (main.round(main.windowHeight / 100) * 100) - 200;
    area = cnvW * cnvH;
  };

  main.centerCanvas = () => {
    cnvX = (main.windowWidth - cnvW) / 2;
    cnvY = (main.windowHeight - cnvH) / 2;
    cnv.position(cnvX, cnvY);
  };

  main.centerPen = () => {
    x = cnvW / 2;
    y = cnvH / 2;
    targetX = cnvW / 2;
    targetY = cnvH / 2;
  };

  main.setup = () => {
    main.scaleCanvas();
    cnv = main.createCanvas(cnvW, cnvH);
    cnv.style('display', 'block');
    main.centerCanvas();
    main.centerPen();

    sw.max = area / 180000;

    mic = new p5.AudioIn();
    fft = new p5.FFT();

    mic.connect(fft);
  };

  main.windowResized = () => {
    if (micStarted == false && blankPage == true) {
      main.scaleCanvas();
      main.resizeCanvas(cnvW, cnvH);
      main.centerCanvas();
      main.centerPen();
      sw.max = area / 180000;
    }
  };

  main.resetVals = () => {
    micStarted = false;
    blankPage = true;

    noiseScale = 0.001;

    main.centerPen();

    sw = {
      level: 0,
      max: 0
    };

    a = {
      level: 255,
      amt: 1.0,
      offset: 150
    };
  };

  main.mousePressed = () => {
    if (micStarted == false) {
      if (blankPage == true) {
        blankPage = false;
      }
      mic.start();
      micStarted = true;
    }
    else {
      mic.stop();
      micStarted = false;
    }
  };

  main.doubleClicked = () => {
    if (blankPage == false) {
      mic.stop();
      main.resetVals();
      main.clear();
    }
  };

  main.draw = () => {
    main.noiseDetail(6, 0.25);

    if (micStarted == true) {
      
      lvl.mic = mic.getLevel(0.5);
      lvl.norm = main.norm(lvl.mic, 0, 0.07);
      spectrum.analysis = fft.analyze();
      spectrum.wm = fft.getCentroid();

      let nwm = 0.0005 * spectrum.wm;
      noiseScale = 0.001 + (main.noise(nwm) * 0.0065);
      noiseScale = main.constrain(noiseScale, 0.001, 0.0075);

      let nt = noiseScale * main.frameCount;
      targetX = (main.width * 1.75) * main.noise(nt + 5000);
      targetY = (main.height * 1.75) * main.noise(nt + 1000);
      targetX = main.constrain(targetX, 0, main.width);
      targetY = main.constrain(targetY, 0, main.height);

      let lerpV = main.map(lvl.norm, 0, 1, 0, 0.07);
      let pointX = main.lerp(x, targetX, lerpV);
      let pointY = main.lerp(y, targetY, lerpV);

      sw.level = main.map(lvl.norm, 0, 1, 0, sw.max);
      sw.level = main.constrain(sw.level, 0, sw.max);

      if (lvl.norm < 0.7) {
        a.amt = main.constrain(main.randomGaussian(0.75, 0.35), -0.5, 1.0);
        a.offset = 150 * a.amt;
        a.level = main.constrain((105 + a.offset), 30, 255);
      }
      else {
        a.level = 255;
      }

      main.stroke(0, 0, 40, a.level);
      main.strokeWeight(sw.level);
      main.line(x, y, pointX, pointY);

      x = pointX;
      y = pointY;
    }
  };
};
let cnv2 = new p5(fg);
