const bg = ( backdrop ) => {

  backdrop.setup = () => {
    backdrop.createCanvas(backdrop.displayWidth, backdrop.displayHeight);
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
};
let cnv1 = new p5(bg);

const fg = ( main ) => {

  let micStarted = false;
  let blankPage = true;
  let firstRun = true;

  let mic, fft;

  let cnv, cnvW, cnvH, cnvX, cnvY, area;

  let x, y, targetX, targetY;

  let font;
  
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

  main.scaleCanvas = () => {
    cnvW = (main.round(main.windowWidth / 100) * 100) - 50;
    cnvH = (main.round(main.windowHeight / 100) * 100) - 50;
    area = cnvW * cnvH;
    sw.max = area / 180000;
  };

  main.centerCanvas = () => {
    cnv.position(25, 25);
  };

  main.setup = () => {
    main.scaleCanvas();
    cnv = main.createCanvas(cnvW, cnvH);
    cnv.parent('content');
    main.centerCanvas();
    main.showHeader();
    main.homePage();

    x = main.width / 2;
    y = main.height / 2;
    targetX = main.width / 2;
    targetY = main.height / 2;

    mic = new p5.AudioIn();
    fft = new p5.FFT();

    mic.connect(fft);
  };

  main.windowResized = () => {
    if (blankPage == true) {
      main.scaleCanvas();
      main.resizeCanvas(cnvW, cnvH);
      main.centerCanvas();
      main.showHeader();
      if (firstRun == true) {
        main.homePage();
      }
      }
    };

  main.showHeader = () => {
    main.loadFont('/o-m-n-d.github.io/QEScottWilliams.ttf', font => {
      main.noStroke();
      main.fill(0, 0, 60);
      main.textFont(font);
      main.textAlign(main.CENTER, main.BASELINE);
      main.textSize(150);
      main.text('scratchpad', main.width / 2, 100);
    });
  };

  main.homePage = () => {
    main.loadFont('/o-m-n-d.github.io/QEScottWilliams.ttf', font => {
      main.noStroke();
      main.fill(0, 0, 60);
      main.textFont(font);
      main.textAlign(main.LEFT, main.BASELINE);
      main.textSize(75);
      main.text('how to use your scratchpad', 50, 200);
      main.text('- full-screen your browser for the nicest experience', 50, 275);
      main.text('- click anywhere to turn on the mic', 50, 350);
      main.text('- make sure to allow microphone access when prompted', 50, 425);
      main.text('- start talking! use your voice to doodle on your scratchpad', 50, 500);
      main.text('- click anywhere to pause and resume drawing', 50, 575);
      main.text('- double-click to clear the page and start over', 50, 650);
    });
  };

  main.resetVals = () => {
    micStarted = false;
    blankPage = true;

    noiseScale = 0.001;

    x = cnvW / 2;
    y = cnvH / 2;
    targetX = cnvW / 2;
    targetY = cnvH / 2;

    sw = {
      level: 0,
      max: 0
    }

    a = {
      level: 255,
      amt: 1.0,
      offset: 150
    };
  };

  main.mousePressed = () => {
    if (micStarted == false) {
      
      if (blankPage == true) {
        main.clear();
        blankPage = false; }
      
      if (firstRun == true) {
        firstRun = false; }
      
      mic.start();
      micStarted = true; }
      
    else {
      mic.stop();
      micStarted = false; }
  };

  main.doubleClicked = () => {
    if (blankPage == false) {
      mic.stop();
      main.resetVals();
      main.clear();
      main.showHeader();
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

      main.stroke(0, 0, 60, a.level);
      main.strokeWeight(sw.level);
      main.line(x, y, pointX, pointY);

      x = pointX;
      y = pointY;
    }
  };
};
let cnv2 = new p5(fg);
