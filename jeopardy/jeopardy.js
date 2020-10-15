// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const NUM_CATEGORIES = 6;
const NUM_CLUES = 5;
const BASE_API = "https://jservice.io/api/";
let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  const arrayId = [];
  //let response = await axios.get(`${BASE_API}random`)
  for (let i = 0; i < NUM_CATEGORIES; i++) {
    const id = await axios.get(`${BASE_API}random`);
    arrayId.push(id.data[0].category.id);
  }
  return arrayId;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const response = await axios.get(`${BASE_API}category?id=${catId}`);
  const dataCat = [];
  for (let i = 0; i < NUM_CLUES; i++) {
    const question = response.data.clues[i].question;
    const answer = response.data.clues[i].answer;
    const id = response.data.clues[i].id;
    let showing = null;
    dataCat.push({ question, answer, showing });
  }
  return {
    title: response.data.title,
    dataCat
  }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  const ids = await getCategoryIds();
  const $table = $('table');
  const $row = $("<tr></tr>");

  $row.attr("id", "column-top");
  for (let i = 0; i < NUM_CATEGORIES; i++) {
    const data = await getCategory(ids[i]);
    categories.push(data);
    $row.append(`<td scope="col" id="${i}" class="header-cell border border-dark text-center align-middle text-light">${data.title.toUpperCase()}</td>`)
  }
  $table.append($row);

  for (let i = 0; i < NUM_CLUES; i++) {
    const $row = $('<tr class="data"></tr>');
    for (let j = 0; j < NUM_CATEGORIES; j++) {
      $row.append($("<td>").attr("id", `${i}-${j}`).text("?").addClass("cell"));
    }
    $table.append($row);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  let x = evt.target.id;
  //console.log(x)
  let [clueId, catId] = x.split('-')
  let data = categories[catId].dataCat[clueId];
  let display;

  if (!data.showing) {
    $(`#${x}`).removeClass('cell');
    $(`#${x}`).addClass('clue');
    display = data.question;
    data.showing = 'question';
  }
  else if (data.showing === 'question') {
    $(`#${x}`).removeClass('clue');
    $(`#${x}`).removeClass('cell');
    $(`#${x}`).addClass('answer');
    display = data.answer;
    data.showing = 'answer'
  } else {
    // ignore click
    return;
  }
  $(`#${x}`).html(display);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $('#spinner').toggleClass('d-none');
  $('button').empty().attr('disabled');
  $('button').html(`<span class="spinner-border spinner-border" role="status" aria-hidden="true"></span> Loading...`)
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#spinner").toggleClass('d-none');
  $("button").empty().removeAttr("disabled");
  $("button").text('Reset!');
}
/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  showLoadingView();
  $("table").empty();
  categories = [];
  await fillTable();
  hideLoadingView()
}

/** On click of start / restart button, set up game. */
$("button").on("click", async function (e) {
  e.preventDefault();
  await setupAndStart();
})
// TODO

/** On page load, add event handler for clicking clues */
$(document).on('click', 'td', handleClick);