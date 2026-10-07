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
                    Control Room
                </p>

            </div>


            <div class="homegrid">

                <div class="panel">

                    <h2>
                        New Game
                    </h2>

                    <p>
                        Choose an empty slot
                        or replace an existing save.
                    </p>


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
                                                ${game.teams.length}
                                                teams
                                                ·
                                                Round
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


                <div class="setupActions">

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

                    if (!label) {
                        return;
                    }

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
                        >
                            −
                        </button>


                        <span
                            class="editableTeamScore"
                            data-edit-score="${teamIndex}"
                            title="Double-click to set score"
                        >
                            ${team.score}
                        </span>


                        <button
                            type="button"
                            class="scoreStep scorePlus"
                            data-score-plus="${teamIndex}"
                            aria-label="Add one point to ${esc(team.name)}"
                        >
                            +
                        </button>

                    </div>

                </article>
            `;
        };


    return `
        <section class="matchupControl">

            <div class="controlSectionHeading">

                <div>

                    <div class="eyebrow">
                        WHO IS ANSWERING?
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
   HOST GAME — WHITEBOARD HALF POINTS
   ============================================================= */

function whiteboardMarkup(game) {

    if (game.teams.length <= 2) {
        return '';
    }


    const active =
        activeMatchupTeams(game);


    const waiting =
        game.matchupOrder.filter(
            index =>
                !active.includes(index)
        );


    if (!waiting.length) {
        return '';
    }


    return `
        <section class="whiteboardControl">

            <div class="controlSectionHeading">

                <div>

                    <div class="eyebrow">
                        WHITEBOARD TEAMS
                    </div>

                    <h3>
                        Half Points
                    </h3>

                </div>


                <small>
                    Award half of the current round bank
                    when a non-competing team answers correctly.
                </small>

            </div>


            <div class="whiteboardTeamGrid">

                ${
                    waiting.map(
                        teamIndex => {

                            const team =
                                game.teams[
                                    teamIndex
                                ];

                            const award =
                                game.whiteboardAwards[
                                    teamIndex
                                ] || 0;


                            return `
                                <button
                                    type="button"
                                    class="
                                        whiteboardTeam
                                        ${
                                            award
                                                ? 'awarded'
                                                : ''
                                        }
                                    "
                                    data-whiteboard="${teamIndex}"
                                >

                                    <span>
                                        ${esc(team.name)}
                                    </span>

                                    <strong>
                                        ${
                                            award
                                                ? `+${award}`
                                                : '½ Bank'
                                        }
                                    </strong>

                                </button>
                            `;
                        }
                    ).join('')
                }

            </div>

        </section>
    `;
}


function wireWhiteboardControls() {

    $$('[data-whiteboard]')
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const teamIndex =
                            +button.dataset.whiteboard;


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


                                const award =
                                    Math.floor(
                                        (+game.bank || 0) /
                                        2
                                    );


                                if (award <= 0) {

                                    alert(
                                        'There are no round points in the bank yet.'
                                    );

                                    return;
                                }


                                game.teams[
                                    teamIndex
                                ].score +=
                                    award;


                                game.whiteboardAwards[
                                    teamIndex
                                ] =
                                    award;
                            }
                        );
                    };
            }
        );
}


/* =============================================================
   HOST GAME — ANSWERS
   ============================================================= */

function answerControlMarkup(
    game,
    question
) {

    return `
        <section class="answerControl">

            <div class="controlSectionHeading">

                <div>

                    <div class="eyebrow">
                        ANSWER BOARD
                    </div>

                    <h3>
                        Reveal Answers
                    </h3>

                </div>


                <div class="roundBankDisplay">

                    <small>
                        ROUND BANK
                    </small>

                    <strong>
                        ${game.bank}
                    </strong>

                </div>

            </div>


            <div class="hostAnswers">

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


                                return `
                                    <button
                                        type="button"
                                        class="
                                            hostAnswer
                                            ${
                                                revealed
                                                    ? 'revealed'
                                                    : ''
                                            }
                                        "
                                        data-answer="${index}"
                                        ${
                                            revealed
                                                ? 'disabled'
                                                : ''
                                        }
                                    >

                                        <span class="hostAnswerNumber">
                                            ${index + 1}
                                        </span>

                                        <span class="hostAnswerText">
                                            ${esc(answer[0])}
                                        </span>

                                        <strong class="hostAnswerPoints">
                                            ${answer[1]}
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


function revealAnswer(
    answerIndex
) {

    mutate(
        game => {

            const question =
                currentQuestion(game);

            if (!question) {
                return;
            }


            if (
                game.revealed.includes(
                    answerIndex
                )
            ) {
                return;
            }


            const answer =
                question.answers[
                    answerIndex
                ];

            if (!answer) {
                return;
            }


            game.revealed.push(
                answerIndex
            );


            const points =
                +answer[1] || 0;


            game.bank += points;


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
                ].score += points;
            }

        },
        {
            type: 'answer',
            index: answerIndex
        }
    );
}


/* =============================================================
   HOST GAME — STRIKES
   ============================================================= */

function addStrike() {

    mutate(
        game => {

            game.strikes =
                Math.min(
                    3,
                    (+game.strikes || 0) + 1
                );
        },
        {
            type: 'incorrect'
        }
    );
}


function removeStrike() {

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


    if (active.length < 2) {
        return null;
    }


    if (
        Number.isInteger(
            game.controllingTeam
        )
    ) {
        return (
            active.find(
                index =>
                    index !==
                    game.controllingTeam
            ) ?? null
        );
    }


    return active[1];
}


function awardSteal(
    success
) {

    mutate(
        game => {

            if (game.stealAwarded) {
                return;
            }


            const controller =
                game.controllingTeam;


            const stealing =
                stealTeamIndex(game);


            if (
                !Number.isInteger(
                    stealing
                ) ||
                !game.teams[stealing]
            ) {
                return;
            }


            game.stealResults = {
                team: stealing,
                success:
                    Boolean(success)
            };


            if (success) {

                const amount =
                    Math.max(
                        0,
                        +game.bank || 0
                    );


                if (
                    Number.isInteger(
                        controller
                    ) &&
                    game.teams[
                        controller
                    ]
                ) {
                    game.teams[
                        controller
                    ].score =
                        Math.max(
                            0,
                            game.teams[
                                controller
                            ].score -
                            amount
                        );
                }


                game.teams[
                    stealing
                ].score +=
                    amount;
            }


            game.stealAwarded =
                true;
        },
        success
            ? {
                type: 'correct'
            }
            : {
                type: 'incorrect'
            }
    );
}


/* =============================================================
   HOST GAME — ROUND NAVIGATION
   ============================================================= */

function nextRound() {

    mutate(
        game => {

            if (
                game.current >=
                game.questions.length - 1
            ) {
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


function previousRound() {

    mutate(
        game => {

            if (game.current <= 0) {
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


/* =============================================================
   HOST GAME — RENDER
   ============================================================= */

function renderHostGame() {

    const game =
        normalizeGame(live());


    if (!game) {

        renderHostHome();

        return;
    }


    const root =
        $('#hostApp');


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
                        This game does not contain
                        any playable questions.
                    </p>

                    <button
                        id="backHome"
                    >
                        Home
                    </button>

                </div>

            </section>
        `;


        $('#backHome').onclick =
            renderHostHome;


        return;
    }


    const stealingTeam =
        stealTeamIndex(game);


    root.innerHTML = `
        <section class="hostGame">

            <header class="hostTopbar">

                <div class="hostGameIdentity">

                    <div class="eyebrow">
                        ${esc(game.name)}
                    </div>

                    <h1>
                        CIT <b>FEUD</b>
                    </h1>

                    <small>
                        Round
                        ${game.current + 1}
                        of
                        ${game.questions.length}
                    </small>

                </div>


                <div class="hostTopActions">

                    <button
                        type="button"
                        id="showScores"
                        class="
                            iconControl
                            ${
                                game.showScores
                                    ? 'active'
                                    : ''
                            }
                        "
                        title="Ranked scores"
                    >
                        🏆
                    </button>


                    <a
                        class="iconControl"
                        href="index.html"
                        target="_blank"
                        title="Open projector"
                    >
                        ${monitorIcon()}
                    </a>


                    <button
                        type="button"
                        id="hostFullscreen"
                        class="iconControl"
                        title="Fullscreen"
                    >
                        ${fullscreenIcon()}
                    </button>


                    <button
                        type="button"
                        id="hostHome"
                        class="ghost"
                    >
                        Home
                    </button>

                </div>

            </header>


            <div class="hostGameGrid">

                <main class="hostMainColumn">

                    <section class="questionControl">

                        <div class="questionMeta">

                            <div>

                                <div class="eyebrow">
                                    ${esc(question.pack || '')}
                                </div>

                                <h2>
                                    ${esc(question.title || '')}
                                </h2>

                            </div>


                            ${tags(question.tags)}

                        </div>


                        <div class="hostQuestionPrompt">
                            ${esc(question.prompt)}
                        </div>


                        ${
                            question.objective

                            ? `
                                <div class="questionObjective">

                                    <strong>
                                        Objective:
                                    </strong>

                                    ${esc(question.objective)}

                                </div>
                            `

                            : ''
                        }


                        ${
                            question.note

                            ? `
                                <div class="questionNote">
                                    ${esc(question.note)}
                                </div>
                            `

                            : ''
                        }

                    </section>


                    ${answerControlMarkup(
                        game,
                        question
                    )}


                    ${
                        Array.isArray(
                            question.talkingPoints
                        ) &&
                        question.talkingPoints.length

                        ? `
                            <section class="talkingPoints">

                                <div class="eyebrow">
                                    INSTRUCTOR TALKING POINTS
                                </div>

                                <ul>

                                    ${
                                        question.talkingPoints
                                            .map(
                                                point =>
                                                    `<li>${esc(point)}</li>`
                                            )
                                            .join('')
                                    }

                                </ul>

                            </section>
                        `

                        : ''
                    }

                </main>


                <aside class="hostControlColumn">

                    ${teamMatchupMarkup(game)}

                    ${whiteboardMarkup(game)}


                    <section class="presentationControl">

                        <div class="controlSectionHeading">

                            <div>

                                <div class="eyebrow">
                                    PROJECTOR
                                </div>

                                <h3>
                                    Presentation
                                </h3>

                            </div>

                            <small>
                                Current:
                                ${phaseLabel(game.phase)}
                            </small>

                        </div>


                        <div class="presentationButtons">

                            <button
                                type="button"
                                id="showRound"
                                class="${
                                    game.phase === 'round'
                                        ? 'active'
                                        : ''
                                }"
                            >
                                Round Intro
                            </button>


                            <button
                                type="button"
                                id="showBoard"
                                class="${
                                    game.phase === 'board'
                                        ? 'active'
                                        : ''
                                }"
                            >
                                Board
                            </button>


                            <button
                                type="button"
                                id="showQuestion"
                                class="${
                                    game.phase === 'question'
                                        ? 'active'
                                        : ''
                                }"
                            >
                                Question
                            </button>


                            <button
                                type="button"
                                id="showSteal"
                                class="${
                                    game.phase === 'steal'
                                        ? 'active'
                                        : ''
                                }"
                            >
                                Steal
                            </button>

                        </div>

                    </section>


                    <section class="strikeControl">

                        <div class="controlSectionHeading">

                            <div>

                                <div class="eyebrow">
                                    STRIKES
                                </div>

                                <h3>
                                    ${
                                        game.strikes
                                    } / 3
                                </h3>

                            </div>

                        </div>


                        <div class="strikeButtons">

                            <button
                                type="button"
                                id="removeStrike"
                                class="ghost"
                            >
                                − Strike
                            </button>


                            <button
                                type="button"
                                id="addStrike"
                                class="danger"
                            >
                                + Strike
                            </button>

                        </div>

                    </section>


                    ${
                        game.phase === 'steal'

                        ? `
                            <section class="stealControl">

                                <div class="controlSectionHeading">

                                    <div>

                                        <div class="eyebrow">
                                            STEAL ATTEMPT
                                        </div>

                                        <h3>
                                            ${
                                                Number.isInteger(
                                                    stealingTeam
                                                )
                                                    ? esc(
                                                        game.teams[
                                                            stealingTeam
                                                        ].name
                                                    )
                                                    : 'Select Teams'
                                            }
                                        </h3>

                                    </div>

                                </div>


                                <div class="stealButtons">

                                    <button
                                        type="button"
                                        id="stealWrong"
                                        class="danger"
                                        ${
                                            game.stealAwarded
                                                ? 'disabled'
                                                : ''
                                        }
                                    >
                                        ✕ Incorrect
                                    </button>


                                    <button
                                        type="button"
                                        id="stealCorrect"
                                        class="success"
                                        ${
                                            game.stealAwarded
                                                ? 'disabled'
                                                : ''
                                        }
                                    >
                                        ✓ Stolen Points
                                    </button>

                                </div>

                            </section>
                        `

                        : ''
                    }


                    <section class="roundNavigation">

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


                        ${
                            isFinalRound(game)

                            ? `
                                <button
                                    type="button"
                                    id="finalRound"
                                    class="finalRoundButton"
                                    disabled
                                >
                                    Final Round
                                </button>
                            `

                            : `
                                <button
                                    type="button"
                                    id="nextRound"
                                >
                                    Next Round →
                                </button>
                            `
                        }

                    </section>

                </aside>

            </div>

        </section>
    `;


    wireHostGameControls();
}


/* =============================================================
   HOST GAME — EVENTS
   ============================================================= */

function wireHostGameControls() {

    wireMatchupControls();

    wireWhiteboardControls();


    $$('[data-answer]')
        .forEach(
            button => {

                button.onclick =
                    () => {

                        revealAnswer(
                            +button.dataset.answer
                        );
                    };
            }
        );


    $('#hostFullscreen').onclick =
        fullscreenToggle;


    $('#showRound').onclick =
        () =>
            mutate(
                gameState => {
                    gameState.phase =
                        'round';
                }
            );


    $('#showBoard').onclick =
        () =>
            mutate(
                gameState => {
                    gameState.phase =
                        'board';
                }
            );


    $('#showQuestion').onclick =
        () =>
            mutate(
                gameState => {
                    gameState.phase =
                        'question';
                }
            );


    $('#showScores').onclick =
        () =>
            mutate(
                gameState => {
                    gameState.showScores =
                        !gameState.showScores;
                }
            );


    $('#showSteal').onclick =
        () => {

            const current =
                normalizeGame(
                    live()
                );


            if (
                current.controllingTeam === null &&
                current.activeTeam === null
            ) {

                alert(
                    'Select which of the two VS teams won the first answer before starting a steal.'
                );

                return;
            }


            mutate(
                gameState => {
                    gameState.phase =
                        'steal';
                }
            );
        };


    $('#addStrike').onclick =
        addStrike;


    $('#removeStrike').onclick =
        removeStrike;


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


    const previous =
        $('#previousRound');


    if (previous) {

        previous.onclick =
            previousRound;
    }


    const next =
        $('#nextRound');


    if (next) {

        next.onclick =
            nextRound;
    }


    $('#hostHome').onclick =
        () => {

            const game =
                normalizeGame(
                    live()
                );


            if (game) {
                save(game);
            }


            renderHostHome();
        };
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

    const safe =
        (
            index +
            VOLUME_LEVELS.length
        ) %
        VOLUME_LEVELS.length;


    localStorage.setItem(
        VOLUME_KEY,
        String(safe)
    );


    return safe;
}


function playSound(name) {

    const source =
        SOUNDS[name];

    if (!source) {
        return;
    }


    const setting =
        VOLUME_LEVELS[
            volumeIndex()
        ];


    if (
        !setting ||
        setting.volume <= 0
    ) {
        return;
    }


    try {

        const audio =
            new Audio(source);

        audio.volume =
            setting.volume;

        audio.play()
            .catch(() => {});

    } catch {
        // Audio is non-critical.
    }
}


/* =============================================================
   PROJECTOR UTILITIES
   ============================================================= */

function createProjectorUtilities() {

    const existing =
        $('.projectorUtilities');

    if (existing) {
        existing.remove();
    }


    const utilities =
        document.createElement('div');


    utilities.className =
        'projectorUtilities';


    utilities.innerHTML = `
        <button
            type="button"
            id="projectorScores"
            class="projectorUtilityButton"
            title="Ranked scores"
            aria-label="Show ranked scores"
        >
            🏆
        </button>


        <button
            type="button"
            id="projectorHome"
            class="projectorUtilityButton"
            title="Save and return home"
            aria-label="Save and return home"
        >
            ⌂
        </button>


        <button
            type="button"
            id="projectorVolume"
            class="projectorUtilityButton"
            title="Volume"
            aria-label="Change volume"
        >
            🔉
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


    document.body.appendChild(
        utilities
    );


    const scoresButton =
        $('#projectorScores', utilities);

    const homeButton =
        $('#projectorHome', utilities);

    const volumeButton =
        $('#projectorVolume', utilities);


    const fullscreenButton =
        $('#projectorFullscreen', utilities);


    function updateVolume() {

        const setting =
            VOLUME_LEVELS[
                volumeIndex()
            ];


        volumeButton.textContent =
            setting.icon;


        volumeButton.title =
            `Volume: ${setting.label}`;
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
            !document.body.classList
                .contains('projector')
        ) {
            return;
        }


        if (
            event.key !== LIVE
        ) {
            return;
        }


        renderProjector();
    }
);


/* =============================================================
   PROJECTOR KEYBOARD
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


        if (
            event.key.toLowerCase() ===
            'f'
        ) {

            fullscreenToggle();
        }
    }
);


/* =============================================================
   STARTUP
   ============================================================= */

async function start() {

    try {

        await loadGamePacks();

    } catch (error) {

        console.error(
            'CIT Feud gamepack loading error:',
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

        renderProjector();
    }
}


start();
