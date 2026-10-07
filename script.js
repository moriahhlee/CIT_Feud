/* =============================================================
   CIT FEUD — MAIN GAME ENGINE
   ============================================================= */

window.CIT_FEUD_PACKS = window.CIT_FEUD_PACKS || [];
const QUESTION_PACKS = window.CIT_FEUD_PACKS;


/* =============================================================
   DYNAMIC GAME PACK LOADER
   ============================================================= */

async function loadGamePacks() {

    const files =
        Array.isArray(window.CIT_FEUD_PACK_FILES)
            ? window.CIT_FEUD_PACK_FILES
            : [];


    if (!files.length) {
        return;
    }


    const alreadyLoaded =
        new Set(
            QUESTION_PACKS
                .map(pack => pack?.sourceFile)
                .filter(Boolean)
        );


    for (const file of files) {

        if (alreadyLoaded.has(file)) {
            continue;
        }


        await new Promise(
            (resolve, reject) => {

                const script =
                    document.createElement('script');


                script.src =
                    file.startsWith('Gamepacks/')
                        ? file
                        : `Gamepacks/${file}`;


                script.onload = resolve;


                script.onerror = () =>
                    reject(
                        new Error(
                            `Could not load game pack: ${file}`
                        )
                    );


                document.head.appendChild(script);
            }
        );
    }
}

const KEY = 'citFeudSlotsV4';
const LIVE = 'citFeudLiveV4';
const CHANNEL = 'cit-feud-v4';
const VOLUME_KEY = 'citFeudVolumeV1';

const SOUNDS = {
    answer: 'Sounds/Answer.mp3',
    correct: 'Sounds/Correct.mp3',
    incorrect: 'Sounds/Incorrect.mp3'
};

const VOLUME_LEVELS = [
    { label: 'Muted', icon: '🔇', volume: 0 },
    { label: 'Low', icon: '🔈', volume: 0.3 },
    { label: 'Medium', icon: '🔉', volume: 0.65 },
    { label: 'High', icon: '🔊', volume: 1 }
];

const bc = ('BroadcastChannel' in window)
    ? new BroadcastChannel(CHANNEL)
    : null;

const $ = (selector, root = document) =>
    root.querySelector(selector);

const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

const esc = value =>
    String(value ?? '').replace(
        /[&<>"']/g,
        character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[character])
    );

let flashAnswer = null;
let buzzerTeam = null;
let wrongVisible = false;


/* =============================================================
   STORAGE
   ============================================================= */

function slots() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) ||
            [null, null, null];
    } catch {
        return [null, null, null];
    }
}

function writeSlots(value) {
    localStorage.setItem(KEY, JSON.stringify(value));
}

function live() {
    try {
        return JSON.parse(localStorage.getItem(LIVE));
    } catch {
        return null;
    }
}

function broadcast(game, event = null) {

    localStorage.setItem(
        LIVE,
        JSON.stringify(game)
    );

    if (bc) {
        bc.postMessage({
            type: 'state',
            game,
            event
        });
    }
}

function save(game, event = null) {

    const saved = slots();

    if (
        Number.isInteger(game.slot) &&
        game.slot >= 0 &&
        game.slot < 3
    ) {
        saved[game.slot] = game;
        writeSlots(saved);
    }

    broadcast(game, event);
}

function notify(game) {
    broadcast(game);
}


/* =============================================================
   GAME STATE
   ============================================================= */

function fresh(
    slot,
    name,
    date,
    packs,
    teams,
    roundCount = null
) {

    const allQuestions = QUESTION_PACKS
        .filter(pack =>
            packs.includes(pack.id)
        )
        .flatMap(pack =>
            pack.questions.map(question => ({
                ...question,
                pack: pack.title
            }))
        );

    const requestedRounds =
        Number.isInteger(+roundCount) && +roundCount > 0
            ? Math.min(+roundCount, allQuestions.length)
            : allQuestions.length;

    const questions =
        allQuestions.slice(0, requestedRounds);

    return {

        version: 4,

        slot,
        name,
        date,
        packs,

        teams: teams.map(
            (teamName, index) => ({
                name:
                    teamName ||
                    `Team ${index + 1}`,
                score: 0
            })
        ),

        questions,

        current: 0,
        round: 1,

        phase: 'round',

        revealed: [],

        strikes: 0,
        bank: 0,

        activeTeam: null,

        controllingTeam: null,

        matchupOrder:
            teams.map((_, index) => index),

        whiteboardAwards: {},

        showScores: false,

        stealResults: {},

        stealAwarded: false,

        attemptLog: [],

        started:
            new Date().toISOString(),

        updated:
            new Date().toISOString()
    };
}


function normalizeGame(game) {

    if (!game) {
        return game;
    }

    if (!Array.isArray(game.teams)) {
        game.teams = [];
    }

    if (!Array.isArray(game.questions)) {
        game.questions = [];
    }

    if (!Array.isArray(game.revealed)) {
        game.revealed = [];
    }

    if (!Array.isArray(game.attemptLog)) {
        game.attemptLog = [];
    }

    if (game.activeTeam === undefined) {
        game.activeTeam = null;
    }

    if (
        game.controllingTeam === undefined
    ) {
        game.controllingTeam = null;
    }

    if (
        !game.stealResults ||
        typeof game.stealResults !== 'object'
    ) {
        game.stealResults = {};
    }

    if (
        game.stealAwarded === undefined
    ) {
        game.stealAwarded = false;
    }


    if (
        !Array.isArray(game.matchupOrder) ||
        game.matchupOrder.length !== game.teams.length
    ) {
        game.matchupOrder =
            game.teams.map((_, index) => index);
    }

    game.matchupOrder =
        game.matchupOrder
            .filter(
                (index, position, values) =>
                    Number.isInteger(index) &&
                    index >= 0 &&
                    index < game.teams.length &&
                    values.indexOf(index) === position
            );

    game.teams.forEach((_, index) => {
        if (!game.matchupOrder.includes(index)) {
            game.matchupOrder.push(index);
        }
    });

    if (
        !game.whiteboardAwards ||
        typeof game.whiteboardAwards !== 'object'
    ) {
        game.whiteboardAwards = {};
    }

    if (game.showScores === undefined) {
        game.showScores = false;
    }

    if (
        !game.phase ||
        game.phase === 'top'
    ) {
        game.phase = 'round';
    }

    if (!Number.isInteger(game.current)) {
        game.current = 0;
    }

    if (!Number.isInteger(game.round)) {
        game.round = game.current + 1;
    }

    return game;
}


function resetRoundState(game) {

    game.revealed = [];

    game.strikes = 0;

    game.bank = 0;

    game.activeTeam = null;

    game.controllingTeam = null;

    game.whiteboardAwards = {};

    game.showScores = false;

    game.stealResults = {};

    game.stealAwarded = false;

    game.attemptLog = [];
}


function mutate(
    callback,
    event = null
) {

    const game =
        normalizeGame(live());

    if (!game) {
        return;
    }

    callback(game);

    game.updated =
        new Date().toISOString();

    save(game, event);

    if (
        document.body.classList
            .contains('host')
    ) {
        renderHostGame();
    }
}


function phaseLabel(phase) {

    return ({
        round: 'Intro',
        board: 'Board',
        question: 'Board + Question',
        steal: 'Steal'
    })[phase] || 'Intro';
}


/* =============================================================
   SHARED UI
   ============================================================= */

function tags(items = []) {

    return `
        <div class="tags">
            ${items
                .slice(0, 3)
                .map(
                    item =>
                        `<span>${esc(item)}</span>`
                )
                .join('')
            }
        </div>
    `;
}


function fullscreenToggle() {

    if (!document.fullscreenElement) {

        document.documentElement
            .requestFullscreen?.();

    } else {

        document.exitFullscreen?.();
    }
}


function fullscreenIcon() {

    return `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M8 3H3v5"></path>
            <path d="M16 3h5v5"></path>
            <path d="M8 21H3v-5"></path>
            <path d="M16 21h5v-5"></path>
        </svg>
    `;
}


function monitorIcon() {

    return `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <rect
                x="3"
                y="4"
                width="18"
                height="13"
                rx="2"
            ></rect>

            <path d="M8 21h8"></path>

            <path d="M12 17v4"></path>
        </svg>
    `;
}


/* =============================================================
   HOST HOME
   ============================================================= */

function renderHostHome() {

    const root = $('#hostApp');

    const saved = slots();

    root.innerHTML = `
        <section class="startup">

            <div class="brand">

                <div class="eyebrow">
                    CRISIS INTERVENTION TRAINING
                </div>

                <h1>
                    CIT <b>FEUD</b>
                </h1>

                <p>
                    Facilitator Control Room
                </p>

            </div>


            <div class="homegrid">

                <div class="panel">

                    <h2>
                        Saved Games
                    </h2>


                    <div class="slots">

                        ${saved.map(
                            (game, index) =>

                                game

                                ? `
                                    <article
                                        class="savecard"
                                    >

                                        <div>

                                            <small>
                                                SLOT ${index + 1}
                                            </small>

                                            <h3>
                                                ${esc(game.name)}
                                            </h3>

                                            <p>
                                                ${esc(game.date)}
                                                ·
                                                ${(game.current || 0) + 1}
                                                /
                                                ${game.questions.length}
                                            </p>

                                        </div>


                                        <div class="actions">

                                            <button
                                                data-resume="${index}"
                                            >
                                                Resume
                                            </button>

                                            <button
                                                class="ghost"
                                                data-new="${index}"
                                            >
                                                Replace
                                            </button>

                                            <button
                                                class="danger ghost"
                                                data-delete="${index}"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </article>
                                `

                                : `
                                    <article
                                        class="savecard empty"
                                    >

                                        <div>

                                            <small>
                                                SLOT ${index + 1}
                                            </small>

                                            <h3>
                                                Empty Save
                                            </h3>

                                            <p>
                                                Available for a new game.
                                            </p>

                                        </div>


                                        <button
                                            data-new="${index}"
                                        >
                                            New Game
                                        </button>

                                    </article>
                                `

                        ).join('')}

                    </div>

                </div>


                <div class="panel help">

                    <h2>
                        Two-screen setup
                    </h2>

                    <ol>

                        <li>
                            Keep this
                            <strong>host.html</strong>
                            window on your laptop.
                        </li>

                        <li>
                            Open
                            <strong>index.html</strong>
                            in a second window.
                        </li>

                        <li>
                            Move that window
                            to the projector.
                        </li>

                        <li>
                            Use fullscreen
                            when ready.
                        </li>

                    </ol>


                    <a
                        class="buttonlike"
                        href="index.html"
                        target="_blank"
                    >
                        Open Projector Board ↗
                    </a>

                </div>

            </div>

        </section>
    `;


    $$('[data-resume]')
        .forEach(button => {

            button.onclick = () => {

                const game =
                    normalizeGame(
                        saved[
                            +button.dataset.resume
                        ]
                    );

                broadcast(game);

                renderHostGame();
            };
        });


    $$('[data-new]')
        .forEach(button => {

            button.onclick = () => {

                renderSetup(
                    +button.dataset.new
                );
            };
        });


    $$('[data-delete]')
        .forEach(button => {

            button.onclick = () => {

                const index =
                    +button.dataset.delete;

                if (
                    confirm(
                        'Delete this saved game?'
                    )
                ) {

                    saved[index] = null;

                    writeSlots(saved);

                    renderHostHome();
                }
            };
        });
}


/* =============================================================
   SETUP
   ============================================================= */

function renderSetup(slot) {

    const root = $('#hostApp');


    root.innerHTML = `
        <section class="startup">

            <div class="brand compact">

                <div class="eyebrow">
                    NEW GAME · SLOT ${slot + 1}
                </div>

                <h1>
                    CIT <b>FEUD</b>
                </h1>

            </div>


            <form
                id="setupForm"
                class="panel setup"
            >

                <h2>
                    Game Details
                </h2>


                <div class="formrow">

                    <label>

                        Game name

                        <input
                            id="gameName"
                            required
                            placeholder="e.g. CIT Academy"
                        >

                    </label>


                    <label>

                        Date

                        <input
                            id="gameDate"
                            type="date"
                            required
                            value="${
                                new Date()
                                    .toISOString()
                                    .slice(0, 10)
                            }"
                        >

                    </label>

                </div>


                <div class="formrow roundCountRow">

                    <label class="roundCountField">

                        Number of rounds

                        <input
                            id="roundCount"
                            type="number"
                            min="1"
                            step="1"
                            value=""
                            required
                        >

                        <small
                            id="roundCountHelp"
                            class="roundCountHelp"
                        ></small>

                    </label>

                </div>


                <h2>
                    Question Packs
                </h2>


                <div
                    id="packChoices"
                    class="packchoices"
                >

                    ${
                        QUESTION_PACKS
                            .map(
                                pack => `
                                    <label
                                        class="packchoice"
                                    >

                                        <input
                                            type="checkbox"
                                            name="packs"
                                            value="${esc(pack.id)}"
                                            checked
                                        >

                                        <span>

                                            <strong>
                                                ${esc(pack.title)}
                                            </strong>

                                            <small>
                                                ${
                                                    esc(
                                                        pack.description ||
                                                        `${pack.questions.length} questions`
                                                    )
                                                }
                                            </small>

                                        </span>

                                    </label>
                                `
                            )
                            .join('')
                    }

                </div>


                <h2>
                    Teams
                </h2>


                <p class="setupHint">
                    Add at least two teams.
                </p>


                <div
                    id="teamInputs"
                    class="teamInputs"
                >

                    <label>

                        Team 1

                        <input
                            class="teamNameInput"
                            required
                            placeholder="Team 1"
                        >

                    </label>


                    <label>

                        Team 2

                        <input
                            class="teamNameInput"
                            required
                            placeholder="Team 2"
                        >

                    </label>

                </div>


                <div class="setupTeamActions">

                    <button
                        type="button"
                        id="addTeam"
                        class="ghost"
                    >
                        + Add Team
                    </button>
                                                </div>


                <div class="setupactions">

                    <button
                        type="button"
                        id="cancelSetup"
                        class="ghost"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                    >
                        Start Game
                    </button>

                </div>

            </form>

        </section>
    `;


    const teamInputs =
        $('#teamInputs');


    function updateTeamLabels() {

        $$('.teamNameInput', teamInputs)
            .forEach(
                (input, index) => {

                    const label =
                        input.closest('label');

                    const textNode =
                        [...label.childNodes]
                            .find(
                                node =>
                                    node.nodeType ===
                                    Node.TEXT_NODE
                            );

                    if (textNode) {
                        textNode.textContent =
                            `\n                        Team ${index + 1}\n\n                        `;
                    }

                    input.placeholder =
                        `Team ${index + 1}`;
                }
            );
    }


    function selectedPackIds() {

        return $$(
            'input[name="packs"]:checked',
            root
        ).map(
            input => input.value
        );
    }


    function availableQuestionCount() {

        const selected =
            selectedPackIds();

        return QUESTION_PACKS
            .filter(
                pack =>
                    selected.includes(pack.id)
            )
            .reduce(
                (total, pack) =>
                    total +
                    pack.questions.length,
                0
            );
    }


    function updateRoundCount() {

        const input =
            $('#roundCount');

        const help =
            $('#roundCountHelp');

        const count =
            availableQuestionCount();


        input.max =
            Math.max(1, count);


        if (
            !input.dataset.userEdited ||
            !input.value ||
            +input.value > count
        ) {
            input.value =
                Math.max(1, count);
        }


        help.textContent =
            count === 1
                ? '1 question available from the selected packs.'
                : `${count} questions available from the selected packs.`;
    }


    $('#roundCount')
        .addEventListener(
            'input',
            event => {
                event.target.dataset.userEdited =
                    'true';
            }
        );


    $$(
        'input[name="packs"]',
        root
    ).forEach(
        input => {

            input.addEventListener(
                'change',
                updateRoundCount
            );
        }
    );


    updateRoundCount();


    $('#addTeam').onclick =
        () => {

            const count =
                $$('.teamNameInput', teamInputs)
                    .length + 1;

            const label =
                document.createElement('label');

            label.innerHTML = `
                Team ${count}

                <input
                    class="teamNameInput"
                    required
                    placeholder="Team ${count}"
                >
            `;

            teamInputs.appendChild(label);

            updateTeamLabels();
        };


    $('#cancelSetup').onclick =
        renderHostHome;


    $('#setupForm').onsubmit =
        event => {

            event.preventDefault();


            const packIds =
                selectedPackIds();


            if (!packIds.length) {

                alert(
                    'Select at least one question pack.'
                );

                return;
            }


            const teams =
                $$('.teamNameInput', root)
                    .map(
                        (input, index) =>
                            input.value.trim() ||
                            `Team ${index + 1}`
                    );


            if (teams.length < 2) {

                alert(
                    'Add at least two teams.'
                );

                return;
            }


            const available =
                availableQuestionCount();


            const requestedRounds =
                Math.max(
                    1,
                    Math.min(
                        available,
                        parseInt(
                            $('#roundCount').value,
                            10
                        ) || available
                    )
                );


            const game =
                fresh(
                    slot,
                    $('#gameName').value.trim(),
                    $('#gameDate').value,
                    packIds,
                    teams,
                    requestedRounds
                );


            save(game);

            renderHostGame();
        };
}


/* =============================================================
   HOST GAME — GENERAL HELPERS
   ============================================================= */

function currentQuestion(
    game = normalizeGame(live())
) {

    if (!game) {
        return null;
    }

    return game.questions[
        game.current
    ] || null;
}


function activeMatchupTeams(game) {

    const order =
        Array.isArray(game.matchupOrder)
            ? game.matchupOrder
            : game.teams.map(
                (_, index) => index
            );


    return order
        .slice(0, 2)
        .filter(
            index =>
                Number.isInteger(index) &&
                index >= 0 &&
                index < game.teams.length
        );
}


function isMatchupTeam(
    game,
    teamIndex
) {

    return activeMatchupTeams(game)
        .includes(teamIndex);
}


function moveTeamInMatchup(
    game,
    fromTeamIndex,
    toTeamIndex
) {

    if (
        fromTeamIndex === toTeamIndex ||
        !Number.isInteger(fromTeamIndex) ||
        !Number.isInteger(toTeamIndex)
    ) {
        return;
    }


    const order =
        [...game.matchupOrder];


    const fromPosition =
        order.indexOf(fromTeamIndex);

    const toPosition =
        order.indexOf(toTeamIndex);


    if (
        fromPosition < 0 ||
        toPosition < 0
    ) {
        return;
    }


    [
        order[fromPosition],
        order[toPosition]
    ] = [
        order[toPosition],
        order[fromPosition]
    ];


    game.matchupOrder = order;


    const active =
        activeMatchupTeams(game);


    if (
        game.controllingTeam !== null &&
        !active.includes(
            game.controllingTeam
        )
    ) {
        game.controllingTeam = null;
        game.activeTeam = null;
    }
}


function setControllingTeam(
    teamIndex
) {

    mutate(
        game => {

            if (
                !isMatchupTeam(
                    game,
                    teamIndex
                )
            ) {
                return;
            }

            game.controllingTeam =
                teamIndex;

            game.activeTeam =
                teamIndex;
        }
    );
}


function adjustTeamScore(
    teamIndex,
    amount
) {

    mutate(
        game => {

            const team =
                game.teams[teamIndex];

            if (!team) {
                return;
            }

            team.score =
                Math.max(
                    0,
                    (+team.score || 0) +
                    amount
                );
        }
    );
}


function editTeamScore(
    teamIndex
) {

    const game =
        normalizeGame(live());

    if (
        !game ||
        !game.teams[teamIndex]
    ) {
        return;
    }


    const team =
        game.teams[teamIndex];


    const response =
        prompt(
            `Set ${team.name}'s score:`,
            team.score
        );


    if (response === null) {
        return;
    }


    const score =
        parseInt(response, 10);


    if (!Number.isFinite(score)) {

        alert(
            'Enter a whole-number score.'
        );

        return;
    }


    mutate(
        current => {

            current.teams[
                teamIndex
            ].score =
                Math.max(0, score);
        }
    );
}


function roundComplete(game) {

    const question =
        currentQuestion(game);

    if (!question) {
        return true;
    }


    return (
        game.revealed.length >=
        question.answers.length
    );
}


function isFinalRound(game) {

    return (
        game.current >=
        game.questions.length - 1
    );
}


/* =============================================================
   HOST GAME — TEAM MATCHUP
   ============================================================= */

function teamMatchupMarkup(game) {

    const order =
        game.matchupOrder;

    const main =
        order.slice(0, 2);

    const waiting =
        order.slice(2);


    const teamCard =
        (
            teamIndex,
            primary = false
        ) => {

            const team =
                game.teams[teamIndex];

            if (!team) {
                return '';
            }


            const selected =
                game.controllingTeam ===
                teamIndex;


            return `
                <article
                    class="
                        matchupTeam
                        ${
                            primary
                                ? 'matchupPrimary'
                                : 'matchupWaiting'
                        }
                        ${
                            selected
                                ? 'isController'
                                : ''
                        }
                    "
                    draggable="true"
                    data-matchup-team="${teamIndex}"
                    tabindex="0"
                    role="button"
                    aria-pressed="${
                        selected
                            ? 'true'
                            : 'false'
                    }"
                    title="${
                        primary
                            ? 'Click to select first-answer team. Drag to change position.'
                            : 'Drag onto another team to change position.'
                    }"
                >

                    <div class="matchupTeamIdentity">

                        <span class="matchupDragHandle">
                            ⋮⋮
                        </span>

                        <strong>
                            ${esc(team.name)}
                        </strong>

                    </div>


                    <div class="matchupTeamScore">

                        <button
                            type="button"
                            class="scoreStep scoreMinus"
                            data-score-minus="${teamIndex}"
                            aria-label="Subtract one point from ${esc(team.name)}"
                            title="-1"
                        >
                            −
                        </button>


                        <span
                            class="editableTeamScore"
                            data-edit-score="${teamIndex}"
                            title="Double-click to edit score"
                        >
                            ${team.score}
                        </span>


                        <button
                            type="button"
                            class="scoreStep scorePlus"
                            data-score-plus="${teamIndex}"
                            aria-label="Add one point to ${esc(team.name)}"
                            title="+1"
                        >
                            +
                        </button>

                    </div>

                </article>
            `;
        };


    return `
        <section class="matchupControl">

            <div class="matchupControlHeader">

                <div>

                    <div class="sectionlabel">
                        WHO IS ANSWERING
                    </div>

                    <h3>
                        Head-to-Head
                    </h3>

                </div>


                <small>
                    Drag teams to rearrange.
                    Click either VS team to select who won the first answer.
                </small>

            </div>


            <div class="matchupVersus">

                ${
                    main[0] !== undefined
                        ? teamCard(
                            main[0],
                            true
                        )
                        : ''
                }


                <div class="versusBadge">
                    VS
                </div>


                ${
                    main[1] !== undefined
                        ? teamCard(
                            main[1],
                            true
                        )
                        : ''
                }

            </div>


            ${
                waiting.length

                ? `
                    <div class="waitingTeams">

                        <div class="waitingTeamsLabel">
                            OTHER TEAMS
                        </div>

                        <div class="waitingTeamsGrid">

                            ${
                                waiting
                                    .map(
                                        teamIndex =>
                                            teamCard(
                                                teamIndex,
                                                false
                                            )
                                    )
                                    .join('')
                            }

                        </div>

                    </div>
                `

                : ''
            }

        </section>
    `;
}


/* =============================================================
   HOST GAME — MATCHUP EVENTS
   ============================================================= */

function wireMatchupControls() {

    const cards =
        $$('[data-matchup-team]');


    let draggedTeam = null;

    let dragOccurred = false;


    cards.forEach(
        card => {

            const teamIndex =
                +card.dataset.matchupTeam;


            card.addEventListener(
                'dragstart',
                event => {

                    draggedTeam =
                        teamIndex;

                    dragOccurred =
                        true;

                    card.classList
                        .add('isDragging');


                    try {

                        event.dataTransfer
                            .setData(
                                'text/plain',
                                String(teamIndex)
                            );

                        event.dataTransfer.effectAllowed =
                            'move';

                    } catch {
                        // Browser fallback uses draggedTeam.
                    }
                }
            );


            card.addEventListener(
                'dragend',
                () => {

                    card.classList
                        .remove('isDragging');


                    $$('.matchupDropTarget')
                        .forEach(
                            element =>
                                element.classList
                                    .remove(
                                        'matchupDropTarget'
                                    )
                        );


                    setTimeout(
                        () => {
                            dragOccurred = false;
                        },
                        0
                    );
                }
            );


            card.addEventListener(
                'dragenter',
                event => {

                    event.preventDefault();

                    if (
                        draggedTeam !== null &&
                        draggedTeam !== teamIndex
                    ) {
                        card.classList
                            .add(
                                'matchupDropTarget'
                            );
                    }
                }
            );


            card.addEventListener(
                'dragover',
                event => {

                    event.preventDefault();

                    try {
                        event.dataTransfer.dropEffect =
                            'move';
                    } catch {
                        // Ignore browser-specific failure.
                    }

                    if (
                        draggedTeam !== null &&
                        draggedTeam !== teamIndex
                    ) {
                        card.classList
                            .add(
                                'matchupDropTarget'
                            );
                    }
                }
            );


            card.addEventListener(
                'dragleave',
                () => {

                    card.classList
                        .remove(
                            'matchupDropTarget'
                        );
                }
            );


            card.addEventListener(
                'drop',
                event => {

                    event.preventDefault();
                    event.stopPropagation();


                    card.classList
                        .remove(
                            'matchupDropTarget'
                        );


                    let source =
                        draggedTeam;


                    try {

                        const transferred =
                            parseInt(
                                event.dataTransfer
                                    .getData(
                                        'text/plain'
                                    ),
                                10
                            );

                        if (
                            Number.isInteger(
                                transferred
                            )
                        ) {
                            source =
                                transferred;
                        }

                    } catch {
                        // Keep draggedTeam fallback.
                    }


                    if (
                        !Number.isInteger(source) ||
                        source === teamIndex
                    ) {
                        return;
                    }


                    mutate(
                        game => {

                            moveTeamInMatchup(
                                game,
                                source,
                                teamIndex
                            );
                        }
                    );


                    draggedTeam = null;
                }
            );


            card.addEventListener(
                'click',
                event => {

                    if (
                        event.target.closest(
                            '.scoreStep'
                        ) ||
                        event.target.closest(
                            '.editableTeamScore'
                        )
                    ) {
                        return;
                    }


                    if (dragOccurred) {
                        return;
                    }


                    const game =
                        normalizeGame(live());


                    if (
                        !game ||
                        !isMatchupTeam(
                            game,
                            teamIndex
                        )
                    ) {
                        return;
                    }


                    setControllingTeam(
                        teamIndex
                    );
                }
            );


            card.addEventListener(
                'keydown',
                event => {

                    if (
                        event.key !== 'Enter' &&
                        event.key !== ' '
                    ) {
                        return;
                    }


                    const game =
                        normalizeGame(live());


                    if (
                        !game ||
                        !isMatchupTeam(
                            game,
                            teamIndex
                        )
                    ) {
                        return;
                    }


                    event.preventDefault();

                    setControllingTeam(
                        teamIndex
                    );
                }
            );
        }
    );


    $$('[data-score-minus]')
        .forEach(
            button => {

                button.onclick =
                    event => {

                        event.stopPropagation();

                        adjustTeamScore(
                            +button.dataset.scoreMinus,
                            -1
                        );
                    };
            }
        );


    $$('[data-score-plus]')
        .forEach(
            button => {

                button.onclick =
                    event => {

                        event.stopPropagation();

                        adjustTeamScore(
                            +button.dataset.scorePlus,
                            1
                        );
                    };
            }
        );


    $$('[data-edit-score]')
        .forEach(
            score => {

                score.ondblclick =
                    event => {

                        event.stopPropagation();

                        editTeamScore(
                            +score.dataset.editScore
                        );
                    };
            }
        );
}


/* =============================================================
   HOST GAME — WHITEBOARD AWARDS
   ============================================================= */

function whiteboardAwardAmount(game) {

    return Math.floor(
        (+game.bank || 0) / 2
    );
}


function awardWhiteboardTeam(
    teamIndex
) {

    mutate(
        game => {

            if (
                isMatchupTeam(
                    game,
                    teamIndex
                )
            ) {
                return;
            }


            if (
                game.whiteboardAwards[
                    teamIndex
                ]
            ) {
                return;
            }


            const amount =
                whiteboardAwardAmount(game);


            if (amount <= 0) {
                return;
            }


            const team =
                game.teams[
                    teamIndex
                ];


            if (!team) {
                return;
            }


            team.score +=
                amount;


            game.whiteboardAwards[
                teamIndex
            ] = amount;
        }
    );
}


function whiteboardMarkup(game) {

    const active =
        activeMatchupTeams(game);


    const otherTeams =
        game.teams
            .map(
                (team, index) => ({
                    team,
                    index
                })
            )
            .filter(
                item =>
                    !active.includes(
                        item.index
                    )
            );


    if (!otherTeams.length) {
        return '';
    }


    const amount =
        whiteboardAwardAmount(game);


    return `
        <section class="whiteboardSection">

            <div class="sectionlabel">
                WHITEBOARD ANSWERS
            </div>


            <p class="microcopy">
                Non-competing teams can earn
                half the current bank for a
                correct whiteboard answer.
            </p>


            <div class="whiteboardTeams">

                ${
                    otherTeams
                        .map(
                            ({
                                team,
                                index
                            }) => {

                                const awarded =
                                    game.whiteboardAwards[
                                        index
                                    ];


                                return `
                                    <button
                                        type="button"
                                        class="
                                            whiteboardAward
                                            ${
                                                awarded
                                                    ? 'awarded'
                                                    : ''
                                            }
                                        "
                                        data-whiteboard="${index}"
                                        ${
                                            awarded ||
                                            amount <= 0
                                                ? 'disabled'
                                                : ''
                                        }
                                    >

                                        <span>
                                            ${esc(team.name)}
                                        </span>

                                        <strong>
                                            ${
                                                awarded
                                                    ? `+${awarded}`
                                                    : `+${amount}`
                                            }
                                        </strong>

                                    </button>
                                `;
                            }
                        )
                        .join('')
                }

            </div>

        </section>
    `;
}


/* =============================================================
   HOST GAME — ANSWER JUDGING
   ============================================================= */

function revealAnswer(
    answerIndex
) {

    const current =
        normalizeGame(live());


    if (!current) {
        return;
    }


    const question =
        currentQuestion(current);


    if (
        !question ||
        !question.answers[
            answerIndex
        ]
    ) {
        return;
    }


    const alreadyRevealed =
        current.revealed
            .includes(answerIndex);


    if (alreadyRevealed) {
        return;
    }


    const points =
        +question.answers[
            answerIndex
        ][1] || 0;


    mutate(
        game => {

            if (
                game.revealed
                    .includes(answerIndex)
            ) {
                return;
            }


            game.revealed.push(
                answerIndex
            );


            game.bank +=
                points;


            if (
                Number.isInteger(
                    game.controllingTeam
                ) &&
                game.teams[
                    game.controllingTeam
                ]
            ) {

                game.teams[
                    game.controllingTeam
                ].score +=
                    points;
            }


            game.attemptLog.push({
                type: 'correct',
                answerIndex,
                team:
                    game.controllingTeam,
                points,
                time:
                    new Date()
                        .toISOString()
            });

        },
        {
            type: 'answer',
            index: answerIndex
        }
    );
}


function markIncorrect() {

    mutate(
        game => {

            game.strikes =
                Math.min(
                    3,
                    (+game.strikes || 0) + 1
                );


            game.attemptLog.push({
                type: 'incorrect',
                team:
                    game.controllingTeam,
                time:
                    new Date()
                        .toISOString()
            });

        },
        {
            type: 'incorrect'
        }
    );
}


function clearStrike() {

    mutate(
        game => {

            game.strikes =
                Math.max(
                    0,
                    (+game.strikes || 0) - 1
                );
        }
    );
}


/* =============================================================
   HOST GAME — STEAL
   ============================================================= */

function stealTeamIndex(game) {

    const active =
        activeMatchupTeams(game);


    if (
        active.length < 2
    ) {
        return null;
    }


    if (
        game.controllingTeam ===
        active[0]
    ) {
        return active[1];
    }


    if (
        game.controllingTeam ===
        active[1]
    ) {
        return active[0];
    }


    return active[1];
}


function awardSteal(
    successful
) {

    mutate(
        game => {

            if (
                game.stealAwarded
            ) {
                return;
            }


            const stealingTeam =
                stealTeamIndex(game);


            if (
                !Number.isInteger(
                    stealingTeam
                ) ||
                !game.teams[
                    stealingTeam
                ]
            ) {
                return;
            }


            const bank =
                +game.bank || 0;


            if (successful) {

                if (
                    Number.isInteger(
                        game.controllingTeam
                    ) &&
                    game.teams[
                        game.controllingTeam
                    ]
                ) {

                    game.teams[
                        game.controllingTeam
                    ].score =
                        Math.max(
                            0,
                            game.teams[
                                game.controllingTeam
                            ].score - bank
                        );
                }


                game.teams[
                    stealingTeam
                ].score +=
                    bank;


                game.stealResults = {
                    successful: true,
                    team:
                        stealingTeam,
                    points:
                        bank
                };

            } else {

                game.stealResults = {
                    successful: false,
                    team:
                        stealingTeam,
                    points: 0
                };
            }


            game.stealAwarded =
                true;
        }
    );
}


/* =============================================================
   HOST GAME — ROUND NAVIGATION
   ============================================================= */

function previousRound() {

    mutate(
        game => {

            if (
                game.current <= 0
            ) {
                return;
            }


            game.current -= 1;

            game.round =
                game.current + 1;

            game.phase =
                'round';

            resetRoundState(game);
        }
    );
}


function nextRound() {

    mutate(
        game => {

            if (
                game.current >=
                game.questions.length - 1
            ) {
                game.showScores =
                    true;

                return;
            }


            game.current += 1;

            game.round =
                game.current + 1;

            game.phase =
                'round';

            resetRoundState(game);
        }
    );
}


/* =============================================================
   HOST GAME — PRESENTATION PHASE
   ============================================================= */

function setPhase(
    phase
) {

    mutate(
        game => {

            game.phase =
                phase;
        }
    );
}


/* =============================================================
   HOST GAME — SCORE RANKING
   ============================================================= */

function toggleScores() {

    mutate(
        game => {

            game.showScores =
                !game.showScores;
        }
    );
}


/* =============================================================
   HOST GAME — RENDER
   ============================================================= */

function renderHostGame() {

    const root =
        $('#hostApp');


    const game =
        normalizeGame(
            live()
        );


    if (!game) {

        renderHostHome();

        return;
    }


    const question =
        currentQuestion(game);


    if (!question) {

        root.innerHTML = `
            <section class="startup">

                <div class="panel">

                    <h2>
                        No questions available
                    </h2>

                    <p>
                        Return home and create
                        a new game with at least
                        one question pack.
                    </p>

                    <button
                        id="emptyGameHome"
                    >
                        Home
                    </button>

                </div>

            </section>
        `;


        $('#emptyGameHome').onclick =
            renderHostHome;


        return;
    }


    const active =
        activeMatchupTeams(game);


    const controlling =
        Number.isInteger(
            game.controllingTeam
        )
            ? game.teams[
                game.controllingTeam
            ]
            : null;


    const stealIndex =
        stealTeamIndex(game);


    const stealTeam =
        Number.isInteger(
            stealIndex
        )
            ? game.teams[
                stealIndex
            ]
            : null;


    root.innerHTML = `
        <section class="control">

            <header class="controltop">

                <div>

                    <div class="eyebrow">
                        CIT FEUD CONTROL ROOM
                    </div>

                    <h1>
                        ${esc(game.name)}
                    </h1>

                    <p>
                        ${esc(game.date)}
                        ·
                        Round ${game.round}
                        of ${game.questions.length}
                    </p>

                </div>


                <div class="controlTopActions">

                    <span class="saveok">
                        AUTO-SAVED
                    </span>


                    <button
                        type="button"
                        class="iconUtility"
                        id="hostFullscreen"
                        title="Fullscreen"
                        aria-label="Fullscreen"
                    >
                        ${fullscreenIcon()}
                    </button>

                </div>

            </header>


            <section
                class="
                    panel
                    presentationControl
                "
            >

                <div>

                    <div class="sectionlabel">
                        PROJECTOR
                    </div>

                    <strong>
                        ${phaseLabel(game.phase)}
                    </strong>

                </div>


                <div class="presentationButtons">

                    <button
                        type="button"
                        class="
                            ghost
                            ${
                                game.phase ===
                                'round'
                                    ? 'active'
                                    : ''
                            }
                        "
                        data-phase="round"
                    >
                        Intro
                    </button>


                    <button
                        type="button"
                        class="
                            ghost
                            ${
                                game.phase ===
                                'board'
                                    ? 'active'
                                    : ''
                            }
                        "
                        data-phase="board"
                    >
                        Board
                    </button>


                    <button
                        type="button"
                        class="
                            ghost
                            ${
                                game.phase ===
                                'question'
                                    ? 'active'
                                    : ''
                            }
                        "
                        data-phase="question"
                    >
                        Question
                    </button>


                    <button
                        type="button"
                        class="
                            ghost
                            ${
                                game.phase ===
                                'steal'
                                    ? 'active'
                                    : ''
                            }
                        "
                        data-phase="steal"
                    >
                        Steal
                    </button>

                </div>


                <div class="presentationUtilityButtons">

                    <button
                        type="button"
                        id="hostScores"
                        class="ghost scoresButton"
                        title="Show ranked scores"
                    >
                        🏆 Scores
                    </button>


                    <button
                        type="button"
                        id="hostHome"
                        class="ghost homeButton"
                        title="Save and return home"
                    >
                        ⌂ Home
                    </button>

                </div>

            </section>


            <div class="controlgrid">

                <main>

                    <section
                        class="
                            panel
                            boardcontrol
                        "
                    >

                        <div class="qmeta">

                            <small>
                                ${esc(
                                    question.pack ||
                                    ''
                                )}
                            </small>

                            <small>
                                QUESTION
                                ${game.current + 1}
                                /
                                ${game.questions.length}
                            </small>

                        </div>


                        <h2>
                            ${esc(question.prompt)}
                        </h2>


                        ${
                            teamMatchupMarkup(
                                game
                            )
                        }


                        <div class="answerlabel sectionlabel">
                            ANSWERS
                        </div>


                        <div class="answerjudge">

                            ${
                                question.answers
                                    .map(
                                        (
                                            answer,
                                            index
                                        ) => {

                                            const revealed =
                                                game.revealed
                                                    .includes(
                                                        index
                                                    );


                                            return `
                                                <div
                                                    class="
                                                        judgeRow
                                                        ${
                                                            revealed
                                                                ? 'correct'
                                                                : ''
                                                        }
                                                    "
                                                >

                                                    <span
                                                        class="answerNum"
                                                    >
                                                        ${index + 1}
                                                    </span>


                                                    <strong>
                                                        ${esc(
                                                            answer[0]
                                                        )}
                                                    </strong>


                                                    <em>
                                                        ${answer[1]}
                                                    </em>


                                                    <button
                                                        type="button"
                                                        class="judge yes"
                                                        data-reveal="${index}"
                                                        ${
                                                            revealed
                                                                ? 'disabled'
                                                                : ''
                                                        }
                                                        title="Correct"
                                                    >
                                                        ✓
                                                    </button>


                                                    <button
                                                        type="button"
                                                        class="judge no"
                                                        data-wrong="${index}"
                                                        title="Incorrect"
                                                    >
                                                        ✕
                                                    </button>

                                                </div>
                                            `;
                                        }
                                    )
                                    .join('')
                            }

                        </div>


                        <div class="bankline">

                            <span>
                                ROUND BANK
                            </span>

                            <strong>
                                ${game.bank}
                            </strong>

                        </div>


                        ${
                            whiteboardMarkup(
                                game
                            )
                        }


                        ${
                            game.phase ===
                            'steal'

                            ? `
                                <section
                                    class="stealAwardControl"
                                >

                                    <div class="sectionlabel">
                                        STEAL RESULT
                                    </div>


                                    <div
                                        class="stealAwardSummary"
                                    >

                                        <div>

                                            <small>
                                                DEFENDING
                                            </small>

                                            <strong>
                                                ${
                                                    controlling
                                                        ? esc(
                                                            controlling.name
                                                        )
                                                        : 'Not selected'
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <small>
                                                STEALING
                                            </small>

                                            <strong>
                                                ${
                                                    stealTeam
                                                        ? esc(
                                                            stealTeam.name
                                                        )
                                                        : 'Not available'
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <small>
                                                BANK
                                            </small>

                                            <strong>
                                                ${game.bank}
                                            </strong>

                                        </div>

                                    </div>


                                    ${
                                        game.stealAwarded

                                        ? `
                                            <p
                                                class="stealResultMessage"
                                            >
                                                ${
                                                    game.stealResults
                                                        .successful

                                                        ? `
                                                            ${
                                                                esc(
                                                                    game.teams[
                                                                        game.stealResults.team
                                                                    ]?.name ||
                                                                    'Stealing team'
                                                                )
                                                            }
                                                            won
                                                            ${game.stealResults.points}
                                                            points.
                                                        `

                                                        : `
                                                            Steal unsuccessful.
                                                            Scores remain unchanged.
                                                        `
                                                }
                                            </p>
                                        `

                                        : `
                                            <div
                                                class="stealAwardButtons"
                                            >

                                                <button
                                                    type="button"
                                                    id="stealCorrect"
                                                >
                                                    ✓ Successful Steal
                                                </button>


                                                <button
                                                    type="button"
                                                    id="stealWrong"
                                                    class="danger"
                                                >
                                                    ✕ Failed Steal
                                                </button>

                                            </div>
                                        `
                                    }

                                </section>
                            `

                            : ''
                        }


                        <div class="roundnav">

                            <button
                                type="button"
                                id="previousRound"
                                class="ghost"
                                ${
                                    game.current <= 0
                                        ? 'disabled'
                                        : ''
                                }
                            >
                                ← Previous
                            </button>


                            <button
                                type="button"
                                id="nextRound"
                            >
                                ${
                                    isFinalRound(game)
                                        ? 'Final Scores'
                                        : 'Next Round →'
                                }
                            </button>

                        </div>

                    </section>

                </main>


                <aside>

                    <section class="panel">

                        <div class="sectionlabel">
                            ROUND STATUS
                        </div>


                        <div class="roundStatus">

                            <div>

                                <small>
                                    CONTROLLING TEAM
                                </small>

                                <strong>
                                    ${
                                        controlling
                                            ? esc(
                                                controlling.name
                                            )
                                            : 'Not selected'
                                    }
                                </strong>

                            </div>


                            <div>

                                <small>
                                    STRIKES
                                </small>

                                <strong>
                                    ${game.strikes} / 3
                                </strong>

                            </div>

                        </div>


                        <div class="strikectl">

                            <span>
                                STRIKES
                            </span>


                            <div class="xs">

                                ${
                                    Array.from(
                                        {
                                            length: 3
                                        },
                                        (
                                            _,
                                            index
                                        ) =>
                                            index <
                                            game.strikes
                                                ? '✕'
                                                : '·'
                                    )
                                    .join('')
                                }

                            </div>


                            <div class="actions">

                                <button
                                    type="button"
                                    id="addStrike"
                                    class="danger"
                                >
                                    + Strike
                                </button>


                                <button
                                    type="button"
                                    id="removeStrike"
                                    class="ghost"
                                    ${
                                        game.strikes <= 0
                                            ? 'disabled'
                                            : ''
                                    }
                                >
                                    − Strike
                                </button>

                            </div>

                        </div>


                        ${
                            game.attemptLog.length

                            ? `
                                <div class="attempts">

                                    <div class="sectionlabel">
                                        RECENT CALLS
                                    </div>

                                    ${
                                        game.attemptLog
                                            .slice(-5)
                                            .reverse()
                                            .map(
                                                attempt => {

                                                    const team =
                                                        Number.isInteger(
                                                            attempt.team
                                                        )
                                                            ? game.teams[
                                                                attempt.team
                                                            ]
                                                            : null;


                                                    return `
                                                        <div>

                                                            <span>
                                                                ${
                                                                    attempt.type ===
                                                                    'correct'
                                                                        ? '✓'
                                                                        : '✕'
                                                                }
                                                            </span>

                                                            <small>
                                                                ${
                                                                    team
                                                                        ? esc(
                                                                            team.name
                                                                        )
                                                                        : 'No team'
                                                                }
                                                            </small>

                                                            <strong>
                                                                ${
                                                                    attempt.type ===
                                                                    'correct'
                                                                        ? `+${attempt.points}`
                                                                        : 'Strike'
                                                                }
                                                            </strong>

                                                        </div>
                                                    `;
                                                }
                                            )
                                            .join('')
                                    }

                                </div>
                            `

                            : ''
                        }

                    </section>


                    <section
                        class="
                            panel
                            facilitator
                        "
                    >

                        <div class="sectionlabel">
                            FACILITATOR
                        </div>

                        <p>
                            Correct answers automatically
                            add their point value to the
                            controlling team's score and
                            the round bank.
                        </p>

                        <p>
                            During a steal, a successful
                            steal transfers the bank from
                            the defending team to the
                            stealing team.
                        </p>

                    </section>

                </aside>

            </div>


            <footer class="hostfooter">

                <a
                    class="buttonlike ghost"
                    href="index.html"
                    target="_blank"
                >
                    Open Projector ↗
                </a>

            </footer>

        </section>
    `;


    $('#hostFullscreen').onclick =
        fullscreenToggle;


    $$('[data-phase]')
        .forEach(
            button => {

                button.onclick =
                    () =>
                        setPhase(
                            button.dataset.phase
                        );
            }
        );


    $('#hostScores').onclick =
        toggleScores;


    $('#hostHome').onclick =
        () => {

            const current =
                normalizeGame(live());


            if (current) {

                current.showScores =
                    false;

                current.updated =
                    new Date()
                        .toISOString();

                save(current);
            }


            renderHostHome();
        };


    wireMatchupControls();


    $$('[data-reveal]')
        .forEach(
            button => {

                button.onclick =
                    () =>
                        revealAnswer(
                            +button.dataset.reveal
                        );
            }
        );


    $$('[data-wrong]')
        .forEach(
            button => {

                button.onclick =
                    markIncorrect;
            }
        );


    $$('[data-whiteboard]')
        .forEach(
            button => {

                button.onclick =
                    () =>
                        awardWhiteboardTeam(
                            +button.dataset.whiteboard
                        );
            }
        );


    $('#addStrike').onclick =
        markIncorrect;


    $('#removeStrike').onclick =
        clearStrike;


    $('#previousRound').onclick =
        previousRound;


    $('#nextRound').onclick =
        nextRound;


    const stealCorrect =
        $('#stealCorrect');


    if (stealCorrect) {

        stealCorrect.onclick =
            () =>
                awardSteal(true);
    }


    const stealWrong =
        $('#stealWrong');


    if (stealWrong) {

        stealWrong.onclick =
            () =>
                awardSteal(false);
    }
}


/* =============================================================
   AUDIO
   ============================================================= */

function volumeIndex() {

    const stored =
        parseInt(
            localStorage.getItem(
                VOLUME_KEY
            ),
            10
        );


    if (
        Number.isInteger(stored) &&
        stored >= 0 &&
        stored <
        VOLUME_LEVELS.length
    ) {
        return stored;
    }


    return 2;
}


function setVolumeIndex(index) {

    localStorage.setItem(
        VOLUME_KEY,
        String(index)
    );
}


function playSound(name) {

    const definition =
        VOLUME_LEVELS[
            volumeIndex()
        ];


    if (
        !definition ||
        definition.volume <= 0 ||
        !SOUNDS[name]
    ) {
        return;
    }


    const audio =
        new Audio(
            SOUNDS[name]
        );


    audio.volume =
        definition.volume;


    audio.play()
        .catch(
            () => {
                // Browser may block audio
                // until user interaction.
            }
        );
}


/* =============================================================
   PROJECTOR UTILITIES
   ============================================================= */

function createProjectorUtilities() {

    let utilities =
        $('.projectorUtilities');


    if (!utilities) {

        utilities =
            document.createElement(
                'div'
            );


        utilities.className =
            'projectorUtilities';


        document.body
            .appendChild(
                utilities
            );
    }


    utilities.innerHTML = `
        <a
            class="projectorUtilityButton projectorControlPanelButton"
            href="host.html"
            target="_blank"
            rel="noopener"
            title="Open Control Panel"
            aria-label="Open Control Panel"
        >
            ${monitorIcon()}

            <span
                class="utilityGear"
                aria-hidden="true"
            >
                ⚙
            </span>
        </a>


        <button
            type="button"
            id="projectorScores"
            class="
                projectorUtilityButton
                projectorScoresButton
            "
            title="Ranked scores"
            aria-label="Ranked scores"
        >
            🏆
        </button>


        <button
            type="button"
            id="projectorHome"
            class="
                projectorUtilityButton
                projectorHomeButton
            "
            title="Save and open control room"
            aria-label="Save and open control room"
        >
            ⌂
        </button>


        <button
            type="button"
            id="projectorVolume"
            class="projectorUtilityButton"
            title="Sound volume"
            aria-label="Sound volume"
        >
        </button>


        <button
            type="button"
            id="projectorFullscreen"
            class="projectorUtilityButton"
            title="Fullscreen"
            aria-label="Fullscreen"
        >
            ${fullscreenIcon()}
        </button>
    `;


    const scoresButton =
        $('#projectorScores');


    const homeButton =
        $('#projectorHome');


    const volumeButton =
        $('#projectorVolume');


    const fullscreenButton =
        $('#projectorFullscreen');


    function updateVolume() {

        const definition =
            VOLUME_LEVELS[
                volumeIndex()
            ];


        volumeButton.textContent =
            definition.icon;


        volumeButton.title =
            `Sound: ${definition.label}`;
    }


    scoresButton.onclick =
        () => {

            const current =
                normalizeGame(live());


            if (!current) {
                return;
            }


            current.showScores =
                !current.showScores;


            current.updated =
                new Date().toISOString();


            save(current);

            renderProjector(current);
        };


    homeButton.onclick =
        () => {

            const current =
                normalizeGame(live());


            if (current) {

                if (
                    !Number.isInteger(current.slot) ||
                    current.slot < 0 ||
                    current.slot > 2
                ) {

                    const saved =
                        slots();


                    const empty =
                        saved.findIndex(
                            item => !item
                        );


                    current.slot =
                        empty >= 0
                            ? empty
                            : 0;
                }


                current.showScores =
                    false;


                current.updated =
                    new Date().toISOString();


                save(current);
            }


            window.location.href =
                'host.html';
        };


    volumeButton.onclick =
        () => {

            const next =
                (
                    volumeIndex() + 1
                ) %
                VOLUME_LEVELS.length;


            setVolumeIndex(next);

            updateVolume();
        };


    fullscreenButton.onclick =
        fullscreenToggle;


    updateVolume();
}
/* =============================================================
   PROJECTOR — TEAM SCORE STRIP
   ============================================================= */

function projectorTeamStrip(game) {

    return `
        <div class="projectorTeamStrip">

            ${
                game.teams
                    .map(
                        (
                            team,
                            index
                        ) => {

                            const controller =
                                game.controllingTeam ===
                                index;


                            const matchup =
                                isMatchupTeam(
                                    game,
                                    index
                                );


                            return `
                                <div
                                    class="
                                        projectorTeamScore
                                        ${
                                            controller
                                                ? 'controller'
                                                : ''
                                        }
                                        ${
                                            matchup
                                                ? 'inMatchup'
                                                : ''
                                        }
                                    "
                                >

                                    <span>
                                        ${esc(team.name)}
                                    </span>

                                    <strong>
                                        ${team.score}
                                    </strong>

                                </div>
                            `;
                        }
                    )
                    .join('')
            }

        </div>
    `;
}


/* =============================================================
   PROJECTOR — ANSWER BOARD
   ============================================================= */

function projectorAnswers(
    game,
    question
) {

    return `
        <div class="answerBoard">

            ${
                question.answers
                    .map(
                        (
                            answer,
                            index
                        ) => {

                            const revealed =
                                game.revealed
                                    .includes(index);


                            const flashing =
                                flashAnswer ===
                                index;


                            return `
                                <div
                                    class="
                                        answerTile
                                        ${
                                            revealed
                                                ? 'revealed'
                                                : ''
                                        }
                                        ${
                                            flashing
                                                ? 'flashAnswer'
                                                : ''
                                        }
                                    "
                                >

                                    <div class="answerTileInner">

                                        <div class="answerFace answerHidden">

                                            <span>
                                                ${index + 1}
                                            </span>

                                        </div>


                                        <div class="answerFace answerShown">

                                            <span class="answerText">
                                                ${esc(answer[0])}
                                            </span>

                                            <strong class="answerPoints">
                                                ${answer[1]}
                                            </strong>

                                        </div>

                                    </div>

                                </div>
                            `;
                        }
                    )
                    .join('')
            }

        </div>
    `;
}


/* =============================================================
   PROJECTOR — RANKED SCORES
   ============================================================= */

function rankedScoresMarkup(game) {

    const ranked =
        game.teams
            .map(
                (team, index) => ({
                    ...team,
                    index
                })
            )
            .sort(
                (a, b) =>
                    b.score - a.score ||
                    a.index - b.index
            );


    const highScore =
        ranked.length
            ? ranked[0].score
            : 0;


    return `
        <div class="scoreRankingOverlay">

            <section class="scoreRankingPanel">

                <div class="scoreRankingHeading">

                    <div class="eyebrow">
                        CIT FEUD
                    </div>

                    <h2>
                        Ranked Scores
                    </h2>

                </div>


                <div class="scoreRankingList">

                    ${
                        ranked
                            .map(
                                (team, index) => `
                                    <div
                                        class="
                                            scoreRankingRow
                                            ${
                                                team.score === highScore
                                                    ? 'leader'
                                                    : ''
                                            }
                                        "
                                    >

                                        <span class="scoreRankingPosition">
                                            ${index + 1}
                                        </span>

                                        <strong class="scoreRankingName">
                                            ${esc(team.name)}
                                        </strong>

                                        <span class="scoreRankingScore">
                                            ${team.score}
                                        </span>

                                    </div>
                                `
                            )
                            .join('')
                    }

                </div>


                <button
                    type="button"
                    class="scoreRankingClose"
                    aria-label="Close ranked scores"
                    title="Close scores"
                >
                    ×
                </button>


                <p class="scoreRankingCloseHint">
                    Press Esc, ×, or the trophy button to return to the game
                </p>

            </section>

        </div>
    `;
}


function closeProjectorScores() {

    const current =
        normalizeGame(live());


    if (
        !current ||
        !current.showScores
    ) {
        return;
    }


    current.showScores =
        false;


    current.updated =
        new Date().toISOString();


    save(current);

    renderProjector(current);
}


function wireScoreRankingClose() {

    const closeButton =
        $('.scoreRankingClose');


    if (closeButton) {

        closeButton.onclick =
            closeProjectorScores;
    }
}


if (
    !window.__citFeudScoreEscapeBound
) {

    window.__citFeudScoreEscapeBound =
        true;


    document.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Escape' &&
                document.body.classList
                    .contains('projector')
            ) {

                const current =
                    normalizeGame(live());


                if (
                    current?.showScores
                ) {

                    event.preventDefault();

                    closeProjectorScores();
                }
            }
        }
    );
}


/* =============================================================
   PROJECTOR
   ============================================================= */

function renderProjector(
    game = live()
) {

    const root =
        $('#projectorApp');


    game =
        normalizeGame(
            game
        );


    if (!game) {

        root.innerHTML = `
            <section
                class="waiting"
            >

                <div
                    class="eyebrow"
                >
                    CRISIS INTERVENTION TRAINING
                </div>

                <h1>
                    CIT <b>FEUD</b>
                </h1>

                <p>
                    Waiting for the host
                    to start or resume a game…
                </p>

            </section>
        `;


        createProjectorUtilities();


        if (game?.showScores) {

            root.insertAdjacentHTML(
                'beforeend',
                rankedScoresMarkup(game)
            );

            wireScoreRankingClose();
        }


        return;
    }


    const question =
        game.questions[
            game.current
        ];


    if (
        game.phase === 'round'
    ) {

        root.innerHTML = `
            <section
                class="roundIntro"
            >

                <div
                    class="eyebrow"
                >
                    CRISIS INTERVENTION TRAINING
                </div>


                <div
                    class="roundWord"
                >
                    ROUND
                </div>


                <div
                    class="roundNumber"
                >
                    ${game.round}
                </div>


                <div
                    class="roundPack"
                >
                    TOP
                    ${question.answers.length}
                    ANSWERS ON THE BOARD
                </div>

            </section>
        `;


        createProjectorUtilities();


        if (game?.showScores) {

            root.insertAdjacentHTML(
                'beforeend',
                rankedScoresMarkup(game)
            );

            wireScoreRankingClose();
        }


        return;
    }


    const stealMode =
        game.phase === 'steal';


    const showQuestion =
        game.phase === 'question' ||
        stealMode;


    const activeTeams =
        activeMatchupTeams(game);


    const controller =
        Number.isInteger(
            game.controllingTeam
        )
            ? game.teams[
                game.controllingTeam
            ]
            : null;


    const stealingIndex =
        stealTeamIndex(game);


    const stealingTeam =
        Number.isInteger(
            stealingIndex
        )
            ? game.teams[
                stealingIndex
            ]
            : null;


    root.innerHTML = `
        <section
            class="
                projectorGame
                ${
                    stealMode
                        ? 'stealMode'
                        : ''
                }
            "
        >

            <header
                class="projectorHeader"
            >

                <div
                    class="projectorBrand"
                >

                    <div
                        class="eyebrow"
                    >
                        CRISIS INTERVENTION TRAINING
                    </div>

                    <h1>
                        CIT <b>FEUD</b>
                    </h1>

                </div>


                <div
                    class="projectorRoundInfo"
                >

                    <span>
                        ROUND
                    </span>

                    <strong>
                        ${game.round}
                    </strong>

                </div>

            </header>


            ${
                showQuestion

                ? `
                    <section
                        class="projectorQuestion"
                    >

                        <div
                            class="projectorQuestionPack"
                        >
                            ${esc(
                                question.pack ||
                                ''
                            )}
                        </div>


                        <h2>
                            ${esc(
                                question.prompt
                            )}
                        </h2>

                    </section>
                `

                : `
                    <section
                        class="projectorQuestion boardOnlyQuestion"
                    >

                        <div
                            class="projectorQuestionPack"
                        >
                            ${esc(
                                question.pack ||
                                ''
                            )}
                        </div>

                    </section>
                `
            }


            <main
                class="projectorBoardArea"
            >

                ${
                    stealMode

                    ? `
                        <div
                            class="stealBanner"
                        >

                            <div
                                class="stealBannerLabel"
                            >
                                STEAL
                            </div>


                            <div
                                class="stealBannerTeams"
                            >

                                ${
                                    controller

                                    ? `
                                        <span>
                                            ${esc(
                                                controller.name
                                            )}
                                        </span>
                                    `

                                    : ''
                                }


                                <strong>
                                    →
                                </strong>


                                ${
                                    stealingTeam

                                    ? `
                                        <span>
                                            ${esc(
                                                stealingTeam.name
                                            )}
                                        </span>
                                    `

                                    : `
                                        <span>
                                            STEAL
                                        </span>
                                    `
                                }

                            </div>

                        </div>
                    `

                    : ''
                }


                ${
                    projectorAnswers(
                        game,
                        question
                    )
                }


                <div
                    class="projectorBank"
                >

                    <span>
                        BANK
                    </span>

                    <strong>
                        ${game.bank}
                    </strong>

                </div>

            </main>


            ${
                projectorTeamStrip(
                    game
                )
            }


            ${
                game.strikes > 0

                ? `
                    <div
                        class="projectorStrikes"
                        aria-label="${game.strikes} strikes"
                    >

                        ${
                            Array.from(
                                {
                                    length:
                                        game.strikes
                                },
                                () =>
                                    '<span>✕</span>'
                            ).join('')
                        }

                    </div>
                `

                : ''
            }


            ${
                stealMode

                ? `
                    <div
                        class="stealAura"
                        aria-hidden="true"
                    ></div>
                `

                : ''
            }


            ${
                buzzerTeam !== null &&
                game.teams[
                    buzzerTeam
                ]

                ? `
                    <div
                        class="buzzerOverlay"
                    >

                        <div
                            class="buzzerTeamName"
                        >
                            ${esc(
                                game.teams[
                                    buzzerTeam
                                ].name
                            )}
                        </div>

                    </div>
                `

                : ''
            }


            ${
                wrongVisible

                ? `
                    <div
                        class="wrongOverlay"
                    >

                        <div
                            class="giantX"
                        >
                            ✕
                        </div>

                    </div>
                `

                : ''
            }

        </section>
    `;


    createProjectorUtilities();


    if (game?.showScores) {

        root.insertAdjacentHTML(
            'beforeend',
            rankedScoresMarkup(game)
        );

        wireScoreRankingClose();
    }
}


/* =============================================================
   LIVE SYNC
   ============================================================= */

if (bc) {

    bc.onmessage =
        event => {

            if (
                !document.body.classList
                    .contains('projector')
            ) {
                return;
            }


            const payload =
                event.data;


            if (
                !payload ||
                payload.type !== 'state'
            ) {
                return;
            }


            const game =
                normalizeGame(
                    payload.game
                );


            const gameEvent =
                payload.event;


            if (
                gameEvent?.type ===
                'answer'
            ) {

                flashAnswer =
                    gameEvent.index;


                playSound(
                    'answer'
                );


                renderProjector(
                    game
                );


                setTimeout(
                    () => {

                        flashAnswer =
                            null;

                        renderProjector(
                            live()
                        );
                    },
                    850
                );


                return;
            }


            if (
                gameEvent?.type ===
                'correct'
            ) {

                playSound(
                    'correct'
                );
            }


            if (
                gameEvent?.type ===
                'incorrect'
            ) {

                playSound(
                    'incorrect'
                );


                wrongVisible =
                    true;


                renderProjector(
                    game
                );


                setTimeout(
                    () => {

                        wrongVisible =
                            false;

                        renderProjector(
                            live()
                        );
                    },
                    850
                );


                return;
            }


            if (
                gameEvent?.type ===
                'buzzer'
            ) {

                buzzerTeam =
                    gameEvent.team;


                renderProjector(
                    game
                );


                setTimeout(
                    () => {

                        buzzerTeam =
                            null;

                        renderProjector(
                            live()
                        );
                    },
                    900
                );


                return;
            }


            renderProjector(
                game
            );
        };
}


/* =============================================================
   STORAGE SYNC FALLBACK
   ============================================================= */

window.addEventListener(
    'storage',
    event => {

        if (
            event.key !== LIVE ||
            !document.body.classList
                .contains('projector')
        ) {
            return;
        }


        const game =
            normalizeGame(
                live()
            );


        renderProjector(
            game
        );
    }
);
/* =============================================================
   PROJECTOR KEYBOARD CONTROLS
   ============================================================= */

document.addEventListener(
    'keydown',
    event => {

        if (
            !document.body.classList
                .contains('projector')
        ) {
            return;
        }


        const game =
            normalizeGame(
                live()
            );


        if (!game) {
            return;
        }


        if (
            event.target &&
            (
                event.target.tagName ===
                    'INPUT' ||
                event.target.tagName ===
                    'TEXTAREA' ||
                event.target.tagName ===
                    'SELECT'
            )
        ) {
            return;
        }


        if (
            event.key === 'f' ||
            event.key === 'F'
        ) {

            event.preventDefault();

            fullscreenToggle();

            return;
        }


        if (
            event.key === 'Escape' &&
            game.showScores
        ) {

            event.preventDefault();

            closeProjectorScores();

            return;
        }
    }
);


/* =============================================================
   HOST KEYBOARD SHORTCUTS
   ============================================================= */

document.addEventListener(
    'keydown',
    event => {

        if (
            !document.body.classList
                .contains('host')
        ) {
            return;
        }


        if (
            event.target &&
            (
                event.target.tagName ===
                    'INPUT' ||
                event.target.tagName ===
                    'TEXTAREA' ||
                event.target.tagName ===
                    'SELECT'
            )
        ) {
            return;
        }


        const game =
            normalizeGame(
                live()
            );


        if (!game) {
            return;
        }


        if (
            event.key === 'f' ||
            event.key === 'F'
        ) {

            event.preventDefault();

            fullscreenToggle();

            return;
        }


        if (
            event.key === '1'
        ) {

            const active =
                activeMatchupTeams(
                    game
                );


            if (
                Number.isInteger(
                    active[0]
                )
            ) {

                event.preventDefault();

                setControllingTeam(
                    active[0]
                );
            }


            return;
        }


        if (
            event.key === '2'
        ) {

            const active =
                activeMatchupTeams(
                    game
                );


            if (
                Number.isInteger(
                    active[1]
                )
            ) {

                event.preventDefault();

                setControllingTeam(
                    active[1]
                );
            }


            return;
        }


        if (
            event.key === 'x' ||
            event.key === 'X'
        ) {

            event.preventDefault();

            markIncorrect();

            return;
        }


        if (
            event.key === 'ArrowRight'
        ) {

            event.preventDefault();

            nextRound();

            return;
        }


        if (
            event.key === 'ArrowLeft'
        ) {

            event.preventDefault();

            previousRound();

            return;
        }
    }
);


/* =============================================================
   PROJECTOR UTILITY POSITION SAFETY
   ============================================================= */

function ensureProjectorUtilities() {

    if (
        !document.body.classList
            .contains('projector')
    ) {
        return;
    }


    createProjectorUtilities();
}


/* =============================================================
   PAGE INITIALIZATION
   ============================================================= */

async function initializeCITFeud() {

    try {

        await loadGamePacks();

    } catch (error) {

        console.error(
            'CIT Feud could not load one or more game packs.',
            error
        );
    }


    if (
        document.body.classList
            .contains('host')
    ) {

        const game =
            normalizeGame(
                live()
            );


        if (game) {

            renderHostGame();

        } else {

            renderHostHome();
        }


        return;
    }


    if (
        document.body.classList
            .contains('projector')
    ) {

        renderProjector(
            normalizeGame(
                live()
            )
        );


        ensureProjectorUtilities();
    }
}


/* =============================================================
   START
   ============================================================= */

if (
    document.readyState ===
    'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        initializeCITFeud
    );

} else {

    initializeCITFeud();
}
