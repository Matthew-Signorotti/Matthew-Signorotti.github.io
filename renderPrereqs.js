const pixelsPerLevel = 8;

function arrayWithInitialValue(len, initialValue) {
  var arr = new Array(len);
  var i;
  for (i = 0; i < len; i++) {
    arr[i] = initialValue;
  }
  return arr;
}

function getNotecard(notes, targetName) {
  var i;
  for (i = 0; i < notes.length; i++) {
    let notecard = notes[i];
    let thisName = notecard.getAttribute('id');
    if (thisName == targetName) {
      return [i, notecard];
    }
  }
}

function getChannelAndAdd(integer) {
  var place = 0;
  while (true) {
    let mask = 1 << place;
    if ((integer & mask) == 0) {
      return [place + 1, mask];
    }
    place++;
  }
}

function renderArcs() {
  var notes = document.querySelectorAll('.notes');
  var rectangles = document.querySelectorAll('rect');
  var notecards = document.querySelector('#notecards');
  var notecardsContainer = document.querySelector('#notecards-container');
  var svg = document.querySelector('svg');

  var cardOffsets = arrayWithInitialValue(notes.length - 1, 0);
  var svgHeight = 0;
  var i;
  for (i = 0; i < rectangles.length; i++) {
    let rect = rectangles[i];

    let from = rect.getAttribute('from');
    let to = rect.getAttribute('to');

    let [fromI, fromCard] = getNotecard(notes, from);
    let [toI, toCard] = getNotecard(notes, to);

    // Update `cardOffsets`
    let j;
    for (j = fromI; j < toI; j++) {
      cardOffsets[j]++;
    }

    // Update svgHeight
    let endHeight = toCard.offsetTop + toCard.offsetHeight / 2;
    svgHeight = Math.max(svgHeight, endHeight);
  }

  /* To determine the padding to set */
  var maximum = 0;
  for (i = 0; i < cardOffsets.length; i++) {
    maximum = Math.max(maximum, cardOffsets[i]);
  }
  notecards.style.marginLeft = (pixelsPerLevel * maximum) + "px";

  /* Draw the rectangles */
  svg.style.height = svgHeight + "px";
  var channelsAvailable = arrayWithInitialValue(notes.length - 1, 0);
  for (i = 0; i < rectangles.length; i++) {
    let rect = rectangles[i];

    let from = rect.getAttribute('from');
    let to = rect.getAttribute('to');

    let [fromI, fromCard] = getNotecard(notes, from);
    let [toI, toCard] = getNotecard(notes, to);

    let startHeight = fromCard.offsetTop + fromCard.offsetHeight / 2;
    let endHeight = toCard.offsetTop + toCard.offsetHeight / 2;

    let [placeOneIndexed, toAdd] = getChannelAndAdd(channelsAvailable[fromI]);
    
    let j;
    for (j = fromI; j < toI; j++) {
      channelsAvailable[j] += toAdd;
    }

    /* Set attributes of `rect` */
    rect.setAttribute('x', (pixelsPerLevel * maximum) - pixelsPerLevel * placeOneIndexed);
    rect.setAttribute('y', startHeight);
    rect.setAttribute('height', endHeight - startHeight);

    /* Set new height of #notecards-container */
    notecardsContainer.style.height = notecards.offsetHeight + "px";
  }
}
