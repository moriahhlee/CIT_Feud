* =============================================================
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
                            value="1"
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

                <p>
                    Select one or multiple packs.
                </p>


                <div class="packgrid">

                    ${QUESTION_PACKS.map(
                        (pack, index) => `
                            <label class="packcard">

                                <input
                                    type="checkbox"
                                    name="pack"
                                    value="${esc(pack.id)}"
                                    ${
                                        index === 0
                                            ? 'checked'
                                            : ''
                                    }
                                >

                                <div>

                                    <h3>
                                        ${esc(pack.title)}
                                    </h3>

                                    <p>
                                        ${
                                            esc(
                                                pack.description ||
                                                ''
                                            )
                                        }
                                    </p>

                                    ${tags(pack.tags)}

                                    <small>
                                        ${pack.questions.length}
                                        questions
                                    </small>

                                </div>

                            </label>
                        `
                    ).join('')}

                </div>


                <h2>
                    Teams
                </h2>


                <div class="formrow">

                    <label>

                        Number of teams

                        <select id="teamCount">

                            <option>
                                2
                            </option>

                            <option>
                                3
                            </option>

                            <option selected>
                                4
                            </option>

                            <option>
                                5
                            </option>

                            <option>
                                6
                            </option>

                        </select>

                    </label>

                </div>


                <div id="teamNames"></div>


                <div class="actions">

                    <button
                        type="button"
                        class="ghost"
                        id="cancelSetup"
                    >
                        Cancel
                    </button>

                    <button type="submit">
                        Start Game
                    </button>

                </div>

            </form>

        </section>
    `;


    const teamCount =
        $('#teamCount');

    const roundCount =
        $('#roundCount');

    const roundCountHelp =
        $('#roundCountHelp');

    function updateRoundLimit() {

        const selectedIds =
            $$('input[name="pack"]:checked')
                .map(input => input.value);

        const available =
            QUESTION_PACKS
                .filter(pack =>
                    selectedIds.includes(pack.id)
                )
                .reduce(
                    (total, pack) =>
                        total + pack.questions.length,
                    0
                );

        const safeAvailable =
            Math.max(1, available);

        roundCount.max =
            String(safeAvailable);

        if (
            !roundCount.value ||
            +roundCount.value > safeAvailable
        ) {
            roundCount.value =
                String(safeAvailable);
        }

        roundCountHelp.textContent =
            available
                ? `${available} round${available === 1 ? '' : 's'} available from the selected pack${selectedIds.length === 1 ? '' : 's'}.`
                : 'Select at least one question pack.';
    }

    $$('input[name="pack"]')
        .forEach(input => {
            input.onchange =
                updateRoundLimit;
        });

    updateRoundLimit();


    function renderTeamNames() {

        $('#teamNames').innerHTML = `
            <div class="teaminputs">

                ${Array.from(
                    {
                        length:
                            +teamCount.value
                    },
                    (_, index) => `
                        <label>

                            Team ${index + 1} name

                            <input
                                name="teamName"
                                value="Team ${index + 1}"
                                maxlength="24"
                            >

                        </label>
                    `
                ).join('')}

            </div>
        `;
    }


    teamCount.onchange =
        renderTeamNames;


    renderTeamNames();


    $('#cancelSetup').onclick =
        renderHostHome;


    $('#setupForm').onsubmit =
        event => {

            event.preventDefault();


            const packs =
                $$(
                    'input[name="pack"]:checked'
                )
                .map(
                    input =>
                        input.value
                );


            const teamNames =
                $$(
                    'input[name="teamName"]'
                )
                .map(
                    input =>
                        input.value.trim()
                );


            const game =
                fresh(
                    slot,
                    $('#gameName')
                        .value
                        .trim(),
                    $('#gameDate')
                        .value,
                    packs,
                    teamNames,
                    +roundCount.value
                );


            if (
                !game.questions.length
            ) {

                alert(
                    'Select at least one pack that contains questions.'
                );

                return;
            }


            save(game);

            renderHostGame();
        };
}


/* =============================================================
   STEAL HELPERS
   ============================================================= */

function eligibleStealTeams(game) {

    if (
        game.controllingTeam === null ||
        !Array.isArray(game.matchupOrder)
    ) {
        return [];
    }

    const activeMatchup =
        game.matchupOrder.slice(0, 2);

    return activeMatchup.filter(
        index =>
            index !== game.controllingTeam
    );
}

function stealWinners(game) {

    return eligibleStealTeams(game)
        .filter(
            index =>
                game.stealResults[
                    String(index)
                ] === true
        );
}


function awardSteal(game) {

    if (game.stealAwarded) {
        return;
    }

    const winners =
        stealWinners(game);

    if (!winners.length) {
        return;
    }

    const winner =
        winners[0];

    if (
        game.controllingTeam !== null &&
        game.teams[game.controllingTeam]
    ) {
        game.teams[game.controllingTeam].score =
            Math.max(
                0,
                game.teams[game.controllingTeam].score -
                game.bank
            );
    }

    game.teams[winner].score +=
        game.bank;

    game.stealAwarded = true;

    game.attemptLog.push({
        ok: true,
        team: game.teams[winner].name,
        answer: `Stole ${game.bank} point bank`,
        time: Date.now()
    });
}

function setupMatchupDragAndDrop() {

    const cards =
        $$('[data-matchup-team]');

    let draggedIndex =
        null;

    cards.forEach(card => {

        card.ondragstart =
            event => {

                draggedIndex =
                    +card.dataset.matchupTeam;

                card.classList.add(
                    'dragging'
                );

                event.dataTransfer.effectAllowed =
                    'move';

                event.dataTransfer.setData(
                    'text/plain',
                    String(draggedIndex)
                );
            };

        card.ondragend =
            () => {

                draggedIndex =
                    null;

                cards.forEach(item =>
                    item.classList.remove(
                        'dragging',
                        'dragTarget'
                    )
                );
            };

        card.ondragover =
            event => {

                event.preventDefault();

                card.classList.add(
                    'dragTarget'
                );

                event.dataTransfer.dropEffect =
                    'move';
            };

        card.ondragleave =
            () =>
                card.classList.remove(
                    'dragTarget'
                );

        card.ondrop =
            event => {

                event.preventDefault();

                const targetIndex =
                    +card.dataset.matchupTeam;

                const sourceIndex =
                    draggedIndex !== null
                        ? draggedIndex
                        : +event.dataTransfer.getData(
                            'text/plain'
                        );

                card.classList.remove(
                    'dragTarget'
                );

                if (
                    !Number.isInteger(sourceIndex) ||
                    sourceIndex === targetIndex
                ) {
                    return;
                }

                mutate(
                    gameState => {

                        const order =
                            [...gameState.matchupOrder];

                        const sourcePosition =
                            order.indexOf(sourceIndex);

                        const targetPosition =
                            order.indexOf(targetIndex);

                        if (
                            sourcePosition < 0 ||
                            targetPosition < 0
                        ) {
                            return;
                        }

                        [
                            order[sourcePosition],
                            order[targetPosition]
                        ] = [
                            order[targetPosition],
                            order[sourcePosition]
                        ];

                        gameState.matchupOrder =
                            order;

                        const active =
                            order.slice(0, 2);

                        if (
                            gameState.controllingTeam !== null &&
                            !active.includes(
                                gameState.controllingTeam
                            )
                        ) {
                            gameState.controllingTeam =
                                null;

                            gameState.activeTeam =
                                null;
                        }

                        gameState.stealResults =
                            {};

                        gameState.stealAwarded =
                            false;
                    }
                );
            };
    });
}


/* =============================================================
   HOST GAME
   ============================================================= */

function renderHostGame() {

    let game =
        normalizeGame(
            live()
        );


    if (!game) {

        renderHostHome();

        return;
    }


    const question =
        game.questions[
            game.current
        ];


    const root =
        $('#hostApp');


    const stealMode =
        game.phase === 'steal';


    const eligible =
        eligibleStealTeams(game);


    const winners =
        stealWinners(game);


    const baseShare =
        winners.length
            ? Math.floor(
                game.bank /
                winners.length
            )
            : 0;


    const remainder =
        winners.length
            ? game.bank %
              winners.length
            : 0;


    const finalRound =
        game.current ===
        game.questions.length - 1;

    const matchupOrder =
        game.matchupOrder || game.teams.map((_, index) => index);

    const matchupTeams =
        matchupOrder.slice(0, 2);

    const benchTeams =
        matchupOrder.slice(2);


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
                        of
                        ${game.questions.length}
                        ·
                        ${esc(question.pack || '')}
                    </p>

                </div>


                <div class="controlTopActions">

                    <div class="saveok">
                        ✓ Autosaved
                    </div>


                    <button
                        id="hostFullscreen"
                        class="iconUtility"
                        title="Fullscreen"
                    >
                        ${fullscreenIcon()}
                    </button>

                </div>

            </header>


            <section
                class="presentationControl panel"
            >

                <div>

                    <div class="sectionlabel">
                        PROJECTOR PRESENTATION
                    </div>

                    <strong>
                        Round ${game.round}
                    </strong>

                    <small
                        class="presentationStatus"
                    >
                        ${
                            phaseLabel(
                                game.phase
                            )
                        }
                    </small>

                </div>


                <div
                    class="presentationButtons"
                >

                    <button
                        id="showRound"
                        class="${
                            game.phase === 'round'
                                ? ''
                                : 'ghost'
                        }"
                    >
                        Intro
                    </button>


                    <button
                        id="showBoard"
                        class="${
                            game.phase === 'board'
                                ? ''
                                : 'ghost'
                        }"
                    >
                        Board
                    </button>


                    <button
                        id="showQuestion"
                        class="${
                            game.phase === 'question'
                                ? ''
                                : 'ghost'
                        }"
                    >
                        Board + Question
                    </button>


                    <button
                        id="showSteal"
                        class="
                            stealPresentation
                            ${
                                game.phase === 'steal'
                                    ? 'active'
                                    : 'ghost'
                            }
                        "
                    >
                        Steal
                    </button>


                    <button
                        id="nextRound"
                        class="presentationNext"
                        ${
                            finalRound
                                ? 'disabled'
                                : ''
                        }
                    >
                        ${
                            finalRound
                                ? 'Final Round'
                                : 'Next Round →'
                        }
                    </button>

                </div>

            </section>


            <div class="controlgrid">

                <section
                    class="panel boardcontrol"
                >

                    <div class="qmeta">

                        ${tags(question.tags)}

                        <small>
                            ${esc(question.title)}
                        </small>

                    </div>


                    <h2>
                        ${esc(question.prompt)}
                    </h2>


                    ${
                        stealMode

                        ? `
                            <div
                                class="stealHostPanel"
                            >

                                <div
                                    class="stealHostHeading"
                                >

                                    <div>

                                        <div
                                            class="sectionlabel"
                                        >
                                            STEAL ROUND
                                        </div>

                                        <h3>
                                            Mark every team
                                            that gets the
                                            steal answer right.
                                        </h3>

                                    </div>


                                    <div
                                        class="stealBankCallout"
                                    >

                                        <span>
                                            AVAILABLE
                                        </span>

                                        <strong>
                                            ${game.bank}
                                        </strong>

                                    </div>

                                </div>


                                ${
                                    game.controllingTeam === null

                                    ? `
                                        <div
                                            class="stealNeedsControl"
                                        >
                                            Choose the
                                            defending team
                                            in Game Control,
                                            then enter
                                            Steal again.
                                        </div>
                                    `

                                    : `
                                        <div
                                            class="defendingTeamHost"
                                        >

                                            <span>
                                                DEFENDING BANK
                                            </span>

                                            <strong>
                                                ${
                                                    esc(
                                                        game
                                                        .teams[
                                                            game
                                                            .controllingTeam
                                                        ]
                                                        .name
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div
                                            class="stealTeamList"
                                        >

                                            ${
                                                eligible
                                                .map(
                                                    index => {

                                                        const result =
                                                            game
                                                            .stealResults[
                                                                String(index)
                                                            ];

                                                        return `
                                                            <div
                                                                class="
                                                                    stealTeamRow
                                                                    ${
                                                                        result === true
                                                                            ? 'stealCorrect'
                                                                            : ''
                                                                    }
                                                                    ${
                                                                        result === false
                                                                            ? 'stealWrong'
                                                                            : ''
                                                                    }
                                                                "
                                                            >

                                                                <div>

                                                                    <small>
                                                                        TEAM
                                                                        ${index + 1}
                                                                    </small>

                                                                    <strong>
                                                                        ${
                                                                            esc(
                                                                                game
                                                                                .teams[
                                                                                    index
                                                                                ]
                                                                                .name
                                                                            )
                                                                        }
                                                                    </strong>

                                                                </div>


                                                                <div
                                                                    class="stealJudgeButtons"
                                                                >

                                                                    <button
                                                                        class="judge yes"
                                                                        data-steal="${index}"
                                                                        data-result="true"
                                                                    >
                                                                        ✓
                                                                    </button>


                                                                    <button
                                                                        class="judge no"
                                                                        data-steal="${index}"
                                                                        data-result="false"
                                                                    >
                                                                        ✕
                                                                    </button>

                                                                </div>

                                                            </div>
                                                        `;
                                                    }
                                                )
                                                .join('')
                                            }

                                        </div>


                                        <div
                                            class="stealAwardSummary"
                                        >

                                            <div>

                                                <span>
                                                    CORRECT TEAMS
                                                </span>

                                                <strong>
                                                    ${winners.length}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    POINTS EACH
                                                </span>

                                                <strong>
                                                    ${
                                                        winners.length

                                                        ? `
                                                            ${baseShare}
                                                            ${
                                                                remainder
                                                                    ? ' + remainder'
                                                                    : ''
                                                            }
                                                        `

                                                        : '—'
                                                    }
                                                </strong>

                                            </div>


                                            <button
                                                id="awardSteal"
                                                ${
                                                    !winners.length ||
                                                    game.stealAwarded

                                                    ? 'disabled'
                                                    : ''
                                                }
                                            >
                                                ${
                                                    game.stealAwarded

                                                    ? 'Steal Awarded ✓'

                                                    : 'Award Steal'
                                                }
                                            </button>

                                        </div>


                                        <p
                                            class="microcopy"
                                        >
                                            Any remainder is
                                            distributed one point
                                            at a time so the entire
                                            bank is awarded.
                                        </p>
                                    `
                                }

                            </div>
                        `

                        : `
                            <div class="buzzsection matchupControl">

                                <div class="matchupControlHeader">

                                    <div>
                                        <div class="sectionlabel">
                                            WHO IS ANSWERING?
                                        </div>

                                        <strong>
                                            Choose who won the first answer
                                        </strong>
                                    </div>

                                    <small>
                                        Drag teams to change the head-to-head matchup.
                                    </small>

                                </div>


                                <div class="matchupPrimary">

                                    ${
                                        matchupTeams[0] !== undefined
                                        ? `
                                            <button
                                                class="matchupTeam ${
                                                    game.controllingTeam === matchupTeams[0]
                                                        ? 'firstAnswer'
                                                        : ''
                                                }"
                                                draggable="true"
                                                data-matchup-team="${matchupTeams[0]}"
                                                data-buzz="${matchupTeams[0]}"
                                            >
                                                <div>
                                                    <strong>
                                                        ${esc(game.teams[matchupTeams[0]].name)}
                                                    </strong>
                                                    <small>
                                                        ${
                                                            game.controllingTeam === matchupTeams[0]
                                                                ? 'FIRST ANSWER · GUESSING'
                                                                : 'CLICK IF FIRST ANSWER'
                                                        }
                                                    </small>
                                                </div>
                                            </button>
                                        `
                                        : ''
                                    }

                                    <div class="matchupVs">
                                        VS
                                    </div>

                                    ${
                                        matchupTeams[1] !== undefined
                                        ? `
                                            <button
                                                class="matchupTeam ${
                                                    game.controllingTeam === matchupTeams[1]
                                                        ? 'firstAnswer'
                                                        : ''
                                                }"
                                                draggable="true"
                                                data-matchup-team="${matchupTeams[1]}"
                                                data-buzz="${matchupTeams[1]}"
                                            >
                                                <div>
                                                    <strong>
                                                        ${esc(game.teams[matchupTeams[1]].name)}
                                                    </strong>
                                                    <small>
                                                        ${
                                                            game.controllingTeam === matchupTeams[1]
                                                                ? 'FIRST ANSWER · GUESSING'
                                                                : 'CLICK IF FIRST ANSWER'
                                                        }
                                                    </small>
                                                </div>
                                            </button>
                                        `
                                        : ''
                                    }

                                </div>


                                ${
                                    benchTeams.length
                                    ? `
                                        <div class="matchupBench">

                                            ${
                                                benchTeams
                                                    .map(index => `
                                                        <div
                                                            class="matchupBenchTeam"
                                                            draggable="true"
                                                            data-matchup-team="${index}"
                                                        >
                                                            <strong>
                                                                ${esc(game.teams[index].name)}
                                                            </strong>
                                                            <small>
                                                                WHITEBOARD
                                                            </small>
                                                        </div>
                                                    `)
                                                    .join('')
                                            }

                                        </div>
                                    `
                                    : ''
                                }


                                <p class="matchupInstruction">
                                    The green team controls the board. Teams underneath are outside the active matchup.
                                </p>

                            </div>
                        `
                    }


                    <div
                        class="sectionlabel answerlabel"
                    >
                        ANSWER BOARD · HOST VIEW
                    </div>


                    <div
                        class="answerjudge"
                    >

                        ${
                            question.answers
                            .map(
                                (answer, index) => `
                                    <div
                                        class="
                                            judgeRow
                                            ${
                                                game.revealed
                                                .includes(index)
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


                                        <b>
                                            ${esc(answer[0])}
                                        </b>


                                        <em>
                                            ${answer[1]} pts
                                        </em>


                                        <button
                                            class="judge yes"
                                            data-correct="${index}"
                                        >
                                            ✓
                                        </button>


                                        <button
                                            class="judge no"
                                            data-wrong="${index}"
                                            ${
                                                stealMode
                                                    ? 'disabled'
                                                    : ''
                                            }
                                        >
                                            ✕
                                        </button>

                                    </div>
                                `
                            )
                            .join('')
                        }

                    </div>


                    <div class="bankline">

                        <span>
                            Round Bank
                        </span>

                        <strong>
                            ${game.bank}
                        </strong>

                    </div>


                    <div class="roundnav">

                        <button
                            id="prevQ"
                            ${
                                game.current === 0
                                    ? 'disabled'
                                    : ''
                            }
                        >
                            ← Previous
                        </button>


                        <button
                            id="resetRound"
                            class="ghost"
                        >
                            Reset Question
                        </button>


                        <button
                            id="nextQ"
                            ${
                                finalRound
                                    ? 'disabled'
                                    : ''
                            }
                        >
                            Next →
                        </button>

                    </div>

                </section>


                <aside
                    class="panel scorepanel"
                >

                    <h2>
                        Game Control
                    </h2>


                    <div
                        class="teamscorelist"
                    >

                        ${
                            game.teams
                            .map(
                                (team, index) => {

                                    const isBench =
                                        benchTeams.includes(index);

                                    const halfPoints =
                                        Math.floor(game.bank / 2);

                                    const halfAwarded =
                                        game.whiteboardAwards[
                                            String(index)
                                        ] === true;

                                    return `
                                        <div
                                            class="
                                                teamctl
                                                ${
                                                    game.activeTeam === index
                                                        ? 'answering'
                                                        : ''
                                                }
                                                ${
                                                    game.controllingTeam === index
                                                        ? 'controlling'
                                                        : ''
                                                }
                                            "
                                        >

                                            <div class="hostTeamHeader">

                                                <input
                                                    value="${esc(team.name)}"
                                                    data-teamname="${index}"
                                                    maxlength="24"
                                                >

                                                <strong
                                                    class="teamScore"
                                                    data-score-edit="${index}"
                                                    title="Double-click to set score"
                                                >
                                                    ${team.score}
                                                </strong>

                                            </div>

                                            <small class="scoreEditHint">
                                                Double-click score to edit
                                            </small>


                                            <div class="teamScoreButtons">

                                                <button
                                                    class="scoreMinus"
                                                    data-score-delta="-1"
                                                    data-score-team="${index}"
                                                    title="Subtract 1 point"
                                                >
                                                    −
                                                </button>

                                                <button
                                                    class="scorePlus"
                                                    data-score-delta="1"
                                                    data-score-team="${index}"
                                                    title="Add 1 point"
                                                >
                                                    +
                                                </button>

                                            </div>


                                            ${
                                                isBench
                                                ? `
                                                    <button
                                                        class="whiteboardAward ${
                                                            halfAwarded
                                                                ? 'awarded'
                                                                : ''
                                                        }"
                                                        data-half-award="${index}"
                                                        ${
                                                            halfAwarded ||
                                                            game.bank <= 0
                                                                ? 'disabled'
                                                                : ''
                                                        }
                                                    >
                                                        ${
                                                            halfAwarded
                                                                ? `Whiteboard ½ awarded ✓`
                                                                : `Whiteboard ½ · +${halfPoints}`
                                                        }
                                                    </button>
                                                `
                                                : ''
                                            }

                                        </div>
                                    `;
                                }
                            )
                            .join('')
                        }

                    </div>


                    <div
                        class="strikectl"
                    >

                        <span>
                            Strike Board
                        </span>


                        <div class="xs">
                            ${
                                '✕'.repeat(
                                    game.strikes
                                )
                            }
                            ${
                                '○'.repeat(
                                    3 -
                                    game.strikes
                                )
                            }
                        </div>


                        <p>

                            ${
                                game.controllingTeam !== null

                                ? `
                                    ${
                                        esc(
                                            game
                                            .teams[
                                                game
                                                .controllingTeam
                                            ]
                                            .name
                                        )
                                    }
                                    controls this round
                                `

                                : game.activeTeam !== null

                                ? `
                                    ${
                                        esc(
                                            game
                                            .teams[
                                                game
                                                .activeTeam
                                            ]
                                            .name
                                        )
                                    }
                                    is answering
                                `

                                : 'Select an answering team'
                            }

                        </p>


                        <button
                            id="addStrike"
                            ${
                                stealMode
                                    ? 'disabled'
                                    : ''
                            }
                        >
                            Manual Strike
                        </button>


                        <button
                            id="clearStrike"
                            class="ghost"
                        >
                            Clear Strikes
                        </button>


                        <button
                            id="clearControl"
                            class="ghost"
                        >
                            Clear Defending Team
                        </button>

                    </div>


                    <div class="attempts">

                        <h3>
                            Recent Calls
                        </h3>


                        ${
                            game.attemptLog.length

                            ? game.attemptLog
                                .slice(-5)
                                .reverse()
                                .map(
                                    attempt => `
                                        <div>

                                            <span>
                                                ${
                                                    attempt.ok
                                                        ? '✓'
                                                        : '✕'
                                                }
                                            </span>

                                            <b>
                                                ${
                                                    esc(
                                                        attempt.team
                                                    )
                                                }
                                            </b>

                                            <small>
                                                ${
                                                    esc(
                                                        attempt.answer ||
                                                        (
                                                            attempt.ok
                                                                ? 'Correct'
                                                                : 'Strike'
                                                        )
                                                    )
                                                }
                                            </small>

                                        </div>
                                    `
                                )
                                .join('')

                            : `
                                <p
                                    class="microcopy"
                                >
                                    Correct answers and
                                    strikes will appear here.
                                </p>
                            `
                        }

                    </div>


                    <div
                        class="facilitator"
                    >

                        <h3>
                            Facilitator Note
                        </h3>

                        <p>
                            ${esc(question.note || '')}
                        </p>

                    </div>


                    <div
                        class="hostfooter"
                    >

                        <button
                            id="openProjector"
                        >
                            Open Projector ↗
                        </button>

                        <button
                            id="homeBtn"
                            class="ghost"
                        >
                            Saved Games
                        </button>

                    </div>

                </aside>

            </div>

        </section>
    `;


/* =============================================================
   HOST EVENT HANDLERS
   ============================================================= */

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
                    'Select the team that controlled the round first, then press Steal again.'
                );

                return;
            }


            mutate(
                gameState => {

                    if (
                        gameState.controllingTeam === null
                    ) {

                        gameState.controllingTeam =
                            gameState.activeTeam;
                    }


                    gameState.phase =
                        'steal';


                    gameState.activeTeam =
                        null;


                    gameState.stealResults =
                        {};


                    gameState.stealAwarded =
                        false;
                }
            );
        };


    $('#nextRound').onclick =
        () =>
            mutate(
                gameState => {

                    if (
                        gameState.current >=
                        gameState.questions.length - 1
                    ) {
                        return;
                    }


                    gameState.current++;


                    gameState.round =
                        gameState.current + 1;


                    resetRoundState(
                        gameState
                    );


                    gameState.phase =
                        'round';
                }
            );


    $$('[data-buzz]')
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const index =
                            +button.dataset.buzz;

                        mutate(
                            gameState => {

                                const activeMatchup =
                                    (gameState.matchupOrder || [])
                                        .slice(0, 2);

                                if (
                                    !activeMatchup.includes(index)
                                ) {
                                    return;
                                }

                                gameState.activeTeam =
                                    index;

                                gameState.controllingTeam =
                                    index;

                                gameState.stealResults =
                                    {};

                                gameState.stealAwarded =
                                    false;
                            },

                            {
                                type: 'buzzer',
                                team: index
                            }
                        );
                    };
            }
        );


    setupMatchupDragAndDrop();

    $$('[data-correct]')
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const index =
                            +button.dataset.correct;


                        const alreadyRevealed =
                            game.revealed
                                .includes(index);


                        mutate(
                            gameState => {

                                const currentQuestion =
                                    gameState.questions[
                                        gameState.current
                                    ];


                                if (
                                    !gameState.revealed
                                        .includes(index)
                                ) {

                                    gameState.revealed
                                        .push(index);


                                    gameState.bank =
                                        gameState.revealed
                                            .reduce(
                                                (
                                                    total,
                                                    answerIndex
                                                ) =>
                                                    total +
                                                    (
                                                        currentQuestion
                                                        .answers[
                                                            answerIndex
                                                        ]?.[1] ||
                                                        0
                                                    ),
                                                0
                                            );

                                    const points =
                                        currentQuestion
                                            .answers[index]?.[1] || 0;

                                    if (
                                        gameState.controllingTeam !== null &&
                                        gameState.teams[
                                            gameState.controllingTeam
                                        ]
                                    ) {
                                        gameState.teams[
                                            gameState.controllingTeam
                                        ].score += points;
                                    }
                                }


                                gameState.attemptLog
                                    .push({

                                        ok: true,

                                        team:
                                            gameState.activeTeam !== null
                                                ? gameState
                                                    .teams[
                                                        gameState
                                                        .activeTeam
                                                    ]
                                                    .name
                                                : 'Unassigned',

                                        answer:
                                            currentQuestion
                                            .answers[
                                                index
                                            ][0],

                                        time:
                                            Date.now()
                                    });

                            },

                            alreadyRevealed

                                ? null

                                : {
                                    type: 'correct',
                                    answerIndex: index
                                }
                        );
                    };
            }
        );


    $$('[data-wrong]')
        .forEach(
            button => {

                button.onclick =
                    () =>
                        mutate(
                            gameState => {

                                if (
                                    gameState.phase ===
                                    'steal'
                                ) {
                                    return;
                                }


                                gameState.strikes =
                                    Math.min(
                                        3,
                                        gameState.strikes + 1
                                    );


                                gameState.attemptLog
                                    .push({

                                        ok: false,

                                        team:
                                            gameState.activeTeam !== null
                                                ? gameState
                                                    .teams[
                                                        gameState
                                                        .activeTeam
                                                    ]
                                                    .name
                                                : 'Unassigned',

                                        time:
                                            Date.now()
                                    });
                            },

                            {
                                type: 'wrong'
                            }
                        );
            }
        );


    $$('[data-steal]')
        .forEach(
            button => {

                button.onclick =
                    () =>
                        mutate(
                            gameState => {

                                gameState.stealResults[
                                    String(
                                        +button.dataset.steal
                                    )
                                ] =
                                    button.dataset.result ===
                                    'true';
                            }
                        );
            }
        );


    if (
        $('#awardSteal')
    ) {

        $('#awardSteal').onclick =
            () =>
                mutate(
                    awardSteal
                );
    }


    $$('[data-score-team]')
        .forEach(
            button => {

                button.onclick =
                    () =>
                        mutate(
                            gameState => {

                                const index =
                                    +button.dataset.scoreTeam;

                                const delta =
                                    +button.dataset.scoreDelta;

                                gameState.teams[index].score =
                                    Math.max(
                                        0,
                                        gameState.teams[index].score +
                                        delta
                                    );
                            }
                        );
            }
        );


    $$('[data-score-edit]')
        .forEach(
            score => {

                score.ondblclick =
                    () => {

                        const index =
                            +score.dataset.scoreEdit;

                        const current =
                            normalizeGame(live());

                        const entered =
                            prompt(
                                `Set score for ${current.teams[index].name}:`,
                                String(current.teams[index].score)
                            );

                        if (entered === null) {
                            return;
                        }

                        const value =
                            Number.parseInt(
                                entered.trim(),
                                10
                            );

                        if (
                            !Number.isFinite(value) ||
                            value < 0
                        ) {
                            alert(
                                'Enter a whole-number score of 0 or higher.'
                            );
                            return;
                        }

                        mutate(
                            gameState => {
                                gameState.teams[index].score =
                                    value;
                            }
                        );
                    };
            }
        );


    $$('[data-half-award]')
        .forEach(
            button => {

                button.onclick =
                    () =>
                        mutate(
                            gameState => {

                                const index =
                                    +button.dataset.halfAward;

                                if (
                                    gameState.whiteboardAwards[
                                        String(index)
                                    ] === true
                                ) {
                                    return;
                                }

                                const bench =
                                    (gameState.matchupOrder || [])
                                        .slice(2);

                                if (!bench.includes(index)) {
                                    return;
                                }

                                gameState.teams[index].score +=
                                    Math.floor(
                                        gameState.bank / 2
                                    );

                                gameState.whiteboardAwards[
                                    String(index)
                                ] = true;
                            }
                        );
            }
        );

    $$('[data-teamname]')
        .forEach(
            input => {

                input.onchange =
                    () =>
                        mutate(
                            gameState => {

                                const index =
                                    +input.dataset.teamname;


                                gameState
                                    .teams[index]
                                    .name =
                                    input.value.trim() ||
                                    `Team ${index + 1}`;
                            }
                        );
            }
        );


    $('#addStrike').onclick =
        () =>
            mutate(
                gameState => {

                    if (
                        gameState.phase ===
                        'steal'
                    ) {
                        return;
                    }


                    gameState.strikes =
                        Math.min(
                            3,
                            gameState.strikes + 1
                        );


                    gameState.attemptLog
                        .push({

                            ok: false,

                            team:
                                gameState.activeTeam !== null
                                    ? gameState
                                        .teams[
                                            gameState
                                            .activeTeam
                                        ]
                                        .name
                                    : 'Unassigned',

                            time:
                                Date.now()
                        });
                },

                {
                    type: 'wrong'
                }
            );


    $('#clearStrike').onclick =
        () =>
            mutate(
                gameState => {
                    gameState.strikes = 0;
                }
            );


    $('#clearControl').onclick =
        () =>
            mutate(
                gameState => {

                    gameState.controllingTeam =
                        null;

                    gameState.activeTeam =
                        null;

                    gameState.stealResults =
                        {};

                    gameState.stealAwarded =
                        false;


                    if (
                        gameState.phase ===
                        'steal'
                    ) {
                        gameState.phase =
                            'question';
                    }
                }
            );


    $('#resetRound').onclick =
        () =>
            mutate(
                gameState => {

                    resetRoundState(
                        gameState
                    );

                    gameState.phase =
                        'round';
                }
            );


    $('#prevQ').onclick =
        () =>
            mutate(
                gameState => {

                    if (
                        gameState.current <= 0
                    ) {
                        return;
                    }


                    gameState.current--;


                    gameState.round =
                        gameState.current + 1;


                    resetRoundState(
                        gameState
                    );


                    gameState.phase =
                        'round';
                }
            );


    $('#nextQ').onclick =
        () =>
            mutate(
                gameState => {

                    if (
                        gameState.current >=
                        gameState.questions.length - 1
                    ) {
                        return;
                    }


                    gameState.current++;


                    gameState.round =
                        gameState.current + 1;


                    resetRoundState(
                        gameState
                    );


                    gameState.phase =
                        'round';
                }
            );


    $('#openProjector').onclick =
        () =>
            window.open(
                'index.html',
                'citfeudprojector'
            );


    $('#homeBtn').onclick =
        renderHostHome;


    notify(game);
}


/* =============================================================
   PROJECTOR AUDIO
   ============================================================= */

function volumeIndex() {

    const index =
        Number(
            localStorage.getItem(
                VOLUME_KEY
            )
        );


    return (
        Number.isInteger(index) &&
        index >= 0 &&
        index < VOLUME_LEVELS.length
    )
        ? index
        : 2;
}


function playSound(name) {

    if (
        !document.body.classList
            .contains('projector')
    ) {
        return;
    }


    const setting =
        VOLUME_LEVELS[
            volumeIndex()
        ];


    if (
        !setting.volume
    ) {
        return;
    }


    const audio =
        new Audio(
            SOUNDS[name]
        );


    audio.volume =
        setting.volume;


    audio.play()
        .catch(
            () => {}
        );
}


function prepareProjectorAudio() {

    const prime =
        () => {

            const audio =
                new Audio(
                    SOUNDS.answer
                );


            audio.volume = 0;


            audio.play()
                .then(
                    () =>
                        audio.pause()
                )
                .catch(
                    () => {}
                );
        };


    window.addEventListener(
        'pointerdown',
        prime,
        {
            once: true
        }
    );


    window.addEventListener(
        'keydown',
        prime,
        {
            once: true
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


        utilities.innerHTML = `

            <a
                class="projectorUtilityButton"
                href="host.html"
                target="_blank"
                title="Host / Admin"
            >

                ${monitorIcon()}

                <span
                    class="utilityGear"
                >
                    ⚙
                </span>

            </a>


            <button
                id="projectorScores"
                class="projectorUtilityButton projectorScoresButton"
                title="Ranked Scores"
            >
                🏆
            </button>


            <button
                id="projectorHome"
                class="projectorUtilityButton projectorHomeButton"
                title="Save and return home"
            >
                ⌂
            </button>


            <button
                id="projectorVolume"
                class="projectorUtilityButton"
            ></button>


            <button
                id="projectorFullscreen"
                class="projectorUtilityButton"
            >
                ${fullscreenIcon()}
            </button>
        `;


        document.body
            .appendChild(
                utilities
            );
    }


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


            localStorage.setItem(
                VOLUME_KEY,
                String(next)
            );


            updateVolume();


            if (
                VOLUME_LEVELS[next]
                    .volume > 0
            ) {
                playSound('answer');
            }
        };


    fullscreenButton.onclick =
        fullscreenToggle;


    updateVolume();
}


/* =============================================================
   PROJECTOR EVENTS
   ============================================================= */

function handleProjectorEvent(event) {

    if (!event) {
        return;
    }


    if (
        event.type === 'buzzer'
    ) {

        buzzerTeam =
            event.team;


        playSound('answer');


        setTimeout(
            () => {

                buzzerTeam =
                    null;

                renderProjector(
                    live()
                );
            },

            650
        );
    }


    if (
        event.type === 'correct'
    ) {

        flashAnswer =
            event.answerIndex;


        playSound('correct');


        setTimeout(
            () => {

                flashAnswer =
                    null;

                renderProjector(
                    live()
                );
            },

            900
        );
    }


    if (
        event.type === 'wrong'
    ) {

        wrongVisible =
            true;


        playSound(
            'incorrect'
        );


        renderProjector(
            live()
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
    }
}


function rankedScoresMarkup(game) {

    const ranked =
        game.teams
            .map((team, index) => ({
                ...team,
                index
            }))
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


                <p class="scoreRankingCloseHint">
                    Press the trophy button to return to the game
                </p>

            </section>

        </div>
    `;
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
    }

        return;
    }


    const stealMode =
        game.phase === 'steal';


    const showQuestion =
        game.phase === 'question' ||
        stealMode;


    const centerHeader =
        stealMode

        ? `
            <div
                class="stealHeader"
            >

                <span>
                    ⚡
                </span>

                <strong>
                    STEAL THE BOARD
                </strong>

                <span>
                    ⚡
                </span>

                <small>
                    EVERY OTHER TEAM CAN STEAL
                </small>

            </div>
        `

        : `
            <div
                class="topStrikeArea"
            >

                <span
                    class="strikeLabel"
                >
                    STRIKES
                </span>


                <div
                    class="topStrikes"
                >

                    ${
                        Array.from(
                            {
                                length: 3
                            },
                            (_, index) => `
                                <span
                                    class="${
                                        index <
                                        game.strikes
                                            ? 'hot'
                                            : ''
                                    }"
                                >
                                    ✕
                                </span>
                            `
                        )
                        .join('')
                    }

                </div>

            </div>
        `;


    root.innerHTML = `
        <section
            class="
                stage
                ${
                    stealMode
                        ? 'stealStage'
                        : ''
                }
            "
        >

            ${
                stealMode
                    ? `
                        <div
                            class="stealEdge"
                        ></div>
                    `
                    : ''
            }


            <header
                class="gameTopBar"
            >

                <div
                    class="miniBrand"
                >

                    <div
                        class="eyebrow"
                    >
                        CRISIS INTERVENTION TRAINING
                    </div>

                    <strong>
                        CIT <b>FEUD</b>
                    </strong>

                </div>


                ${centerHeader}


                <div
                    class="roundbadge"
                >

                    ROUND ${game.round}

                    <small>
                        ${esc(question.title)}
                    </small>

                </div>

            </header>


            <main
                class="projectorGameArea"
            >

                <div
                    class="
                        prompt
                        ${
                            showQuestion
                                ? 'questionVisible'
                                : 'questionHidden'
                        }
                    "
                >

                    ${
                        showQuestion
                            ? esc(question.prompt)
                            : '&nbsp;'
                    }

                </div>


                <div
                    class="projectorAnswers"
                >

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
                                    <div
                                        class="
                                            tile
                                            ${
                                                revealed
                                                    ? 'revealed'
                                                    : ''
                                            }
                                            ${
                                                flashAnswer === index
                                                    ? 'correctFlash'
                                                    : ''
                                            }
                                        "
                                    >

                                        <span>
                                            ${index + 1}
                                        </span>


                                        <b>
                                            ${
                                                revealed
                                                    ? esc(answer[0])
                                                    : ''
                                            }
                                        </b>


                                        <em>
                                            ${
                                                revealed
                                                    ? answer[1]
                                                    : ''
                                            }
                                        </em>

                                    </div>
                                `;
                            }
                        )
                        .join('')
                    }

                </div>


                <div
                    class="projectorBank"
                >

                    <span>
                        ROUND BANK
                    </span>

                    <strong>
                        ${game.bank}
                    </strong>

                </div>

            </main>


            <footer
                class="projectorScores"
                style="
                    grid-template-columns:
                    repeat(
                        ${game.teams.length},
                        minmax(0,1fr)
                    );
                "
            >

                ${
                    game.teams
                    .map(
                        (
                            team,
                            index
                        ) => {

                            const defending =
                                stealMode &&
                                game.controllingTeam ===
                                index;


                            const eligible =
                                stealMode &&
                                game.controllingTeam !==
                                index;


                            return `
                                <div
                                    class="
                                        projectorTeam

                                        ${
                                            game.activeTeam === index
                                                ? 'activeAnswerer'
                                                : ''
                                        }

                                        ${
                                            buzzerTeam === index
                                                ? 'buzzerFlash'
                                                : ''
                                        }

                                        ${
                                            defending
                                                ? 'defendingTeam'
                                                : ''
                                        }

                                        ${
                                            eligible
                                                ? 'stealEligible'
                                                : ''
                                        }
                                    "
                                >

                                    <div
                                        class="projectorTeamIdentity"
                                    >

                                        <span>
                                            ${esc(team.name)}
                                        </span>


                                        ${
                                            stealMode

                                            ? defending

                                                ? `
                                                    <small>
                                                        DEFENDING
                                                    </small>
                                                `

                                                : `
                                                    <small>
                                                        STEAL ELIGIBLE
                                                    </small>
                                                `

                                            : game.activeTeam === index

                                                ? `
                                                    <small>
                                                        ANSWERING
                                                    </small>
                                                `

                                                : ''
                                        }

                                    </div>


                                    <strong>
                                        ${team.score}
                                    </strong>

                                </div>
                            `;
                        }
                    )
                    .join('')
                }

            </footer>

        </section>


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
    `;


    createProjectorUtilities();

    if (game?.showScores) {
        root.insertAdjacentHTML(
            'beforeend',
            rankedScoresMarkup(game)
        );
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
                payload &&
                payload.type === 'state' &&
                payload.game
            ) {

                renderProjector(
                    payload.game
                );


                handleProjectorEvent(
                    payload.event
                );

            } else {

                renderProjector(
                    payload
                );
            }
        };
}


window.addEventListener(
    'storage',
    event => {

        if (
            event.key === LIVE &&
            document.body.classList
                .contains('projector')
        ) {

            renderProjector(
                live()
            );
        }
    }
);


/* =============================================================
   START
   ============================================================= */

async function startCitFeud() {

    try {
        await loadGamePacks();
    } catch (error) {
        console.error(error);
    }


    if (
        document.body.classList
            .contains('host')
    ) {

        renderHostHome();

    } else {

        prepareProjectorAudio();

        renderProjector();
    }
}


startCitFeud();
