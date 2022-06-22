let table;
let yes_button;
let no_button;
let maybe_button;
let restart_button;
let guess;
let question_phrase;
let display_question;
let question_number;
let thinking_phrase
let display_thinking;
let qColStart = 4;
let current_img;
let bg_image;
let prof_image;
let state = 'START'
let ticker = 0;
let prof_shake = 0;


function preload() {
  table = loadTable('assets/pokemon_data_final.csv', 'csv', 'header');

}

function setup() {
  shuffleTable();

  //frameRate(15);

  bg_image = loadImage('assets/background.jpg');
  prof_image = loadImage('assets/prof.png');

  yes_button = createButton('YES');
  yes_button.position(150, 610);
  yes_button.mousePressed(yes_answer);

  no_button = createButton('NO');
  no_button.position(200, 610);
  no_button.mousePressed(no_answer);

  maybe_button = createButton('MAYBE/NOT SURE');
  maybe_button.position(250, 610);
  maybe_button.mousePressed(maybe_answer);

  restart_button = createButton('RESTART');
  restart_button.position(400, 610);
  restart_button.mousePressed(restart_game);

  pick_mon();

}

function draw() {
  // put drawing code here

  //background and pikachu
  createCanvas(800, 600);
  imageMode(CORNER);
  image(bg_image, 0, 0, 800, 600);
  push();

  imageMode(CENTER)
  translate(650, 460);
  rotate(prof_shake / 200);
  image(prof_image, 0, 0 + prof_shake);
  pop();

  //professor shake
  //
  if (table.getRowCount() != 0) {
    prof_shake = 10 * sin(ticker);
    ticker += 1 / table.getRowCount() + 0.05
  } else {
    ticker = 1
  }

  //print(prof_shake);

  let p = createP('Created by @7ittledreams (2022). For educational use only');
  p.style('font-size', '16px');
  p.style('font-family', 'Tahoma');
  p.style('color', '#808080');
  p.position(10, 625);

  //text box
  noStroke();
  fill(255, 0, 0);
  rect(10, 10, 500, 190);
  fill(255);
  rect(15, 15, 490, 180);

  //text in textbox
  fill(0);
  textSize(14);
  textFont('Courier New');

  if (table.getRowCount() > 1 && state == 'PLAY') {
    text("I think it could be " + guess.getString('name') + ", (" + table.getRowCount() + " / 994)", 17, 17, 490, 100);
  }

  textSize(32);
  text(question_phrase, 17, 35, 490, 270);

  //thoughtbubble
  if (table.getRowCount() > 1) {
    ellipseMode(CENTER);
    rectMode(CENTER);
    fill(255);
    stroke(0);
    strokeWeight(1);
    circle(630, 380, 20);
    circle(640, 350, 30);
    circle(650, 305, 50);
    rect(660, 150, 270, 270, 50);
    imageMode(CENTER);
    rectMode(CORNER);
    //pokemon image resize
    if (current_img.width > current_img.height) {
      current_img.resize(230, 0)
    } else {
      current_img.resize(0, 230);
    }
    image(current_img, 660, 150);
  } else {
    //remove thoughtbubble and add large picture
    fill(255, 255, 0);
    rect(10, 170, 500, 425);
    fill(255);
    rect(15, 175, 490, 415);
    imageMode(CENTER);
    if (current_img.width > current_img.height) {
      current_img.resize(450, 0)
    } else {
      current_img.resize(0, 330);
    }
    image(current_img, 253, 380);
  }

}

function pick_mon() {
  //chooses a random pokemon from the remaining list to base the next question on.//
  //That pokemon is stored as 'guess'//
  let row_count = table.getRowCount();
  let num = round(random(0, row_count - 1));
  guess = table.getRow(num);
  current_img = loadImage('assets/images/' + guess.getString('name') + '/0.jpg');

  //Works out whether to choose a question, win or end the game
  if (table.getColumnCount - qColStart == 0) {
    lose_game();
  }

  if (row_count > 1) {
    ask_question();
  } else if (row_count == 1) {
    guess = table.getRow(0);
    state = 'END'
    final_guess();
  } else if (row_count == 0) {
    lose_game();
  }

}

function ask_question() {
  //picks a question that answers true for the current guessed pokemon
  //table.removeColumn(question_number);
  if (state == 'START') {
    question_phrase = 'Think of a Pokemon and I will guess it. You could try ' + guess.getString('name') + '. Are you ready?'
  }

  if (state == 'PLAY') {
    let lastQuestion = question_number
    for (let i = qColStart; i < table.getColumnCount(); i++) {
      if (guess.get(i) == 1) {
        question_number = i;
        question_phrase = table.columns[question_number];
      }
    }
    if (question_number == lastQuestion) {
      question_number = 2;
      question_phrase = 'Is your Pokemon ' + guess.getString('name') + '?';
    }
  }
}

function final_guess() {
  question_phrase = 'Your Pokemon is ' + guess.getString('name') + ', the ' + guess.getString('species') +
    '!';
}

function win_game() {
  question_phrase = "Awesome!" + guess.getString('name') +
    " was a great choice! Let's play again!"
}

function lose_game() {
  question_phrase = "Oh no, I couldn't guess your Pokemon, sorry. Let's try again"
  //table = loadTable('assets/pokemon_data_final.csv', 'csv', 'header');
}

function yes_answer() {
  //removes pokemon that do not match the characteristic of the current guessed pokemon
  if (state == 'START') {
    state = 'PLAY'
    pick_mon();
    return;
  }

  if (state == 'END') {
    win_game();
    return;
  }

  for (var i = table.getRowCount() - 1; i >= 0; i--) {
    let index = table.getRow(i);
    if (index.get(question_number) != guess.get(question_number)) {
      table.removeRow(i);
    }
  }
  if (question_number >= qColStart) {
    table.removeColumn(question_number);
  }
  pick_mon();
}

function no_answer() {
  if (state == 'START') {
    pick_mon()
    return;
  }
  if (state == 'END') {
    lose_game();
    return;
  }
  //removes pokemon that match the characteristic of the current guessed pokemon
  for (var i = table.getRowCount() - 1; i >= 0; i--) {
    let index = table.getRow(i);
    if (index.get(question_number) == guess.get(question_number)) {
      table.removeRow(i);
    }
  }
  if (question_number >= qColStart) {
    table.removeColumn(question_number);
  }
  pick_mon();
}

function maybe_answer() {
  if (state == 'START') {
    pick_mon()
    return;
  }
  if (state == 'END') {
    lose_game();
    return;
  }

  if (question_number >= qColStart) {
    table.removeColumn(question_number);
  }
  pick_mon();
}

function restart_game() {
  table = loadTable('assets/pokemon_data_final.csv', 'csv', 'header', shuffleTable);
  state = 'START'
  ticker = 0;
}

function shuffleTable() {
  for (var i = table.getColumnCount(); i >= qColStart; i--) {
    let q = int(random(qColStart, table.getColumnCount()));
    let coltitle = table.columns[q]
    let coll = table.getColumn(q);
    table.addColumn(coltitle);
    for (var j = 0; j < coll.length - 1; j++) {
      table.set(j, table.getColumnCount() - 1, coll[j]);
    }
    table.removeColumn(q);
  }
  pick_mon();
}