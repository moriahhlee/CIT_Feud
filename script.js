/* =============================================================
   CIT FEUD
   MAIN GAME ENGINE

   Question packs are loaded separately from:
   GamePacks/*.js

   Game audio originates ONLY from the projector page.
   ============================================================= */


/* =============================================================
   GAME PACKS
   ============================================================= */

const QUESTION_PACKS =
    Array.isArray(window.CIT_FEUD_PACKS)
        ? window.CIT_FEUD_PACKS
        : [];


/* =============================================================
   STORAGE / COMMUNICATION
   ============================================================= */

const KEY = 'citFeudSlotsV4';
const LIVE = 'citFeudLiveV4';
const CHANNEL = 'cit-feud-v4';
const VOLUME_KEY = 'citFeudVolumeV1';

const bc =
    ('BroadcastChannel' in window)
        ? new BroadcastChannel(CHANNEL)
        : null;


/* =============================================================
   SOUND FILES
   ============================================================= */

const SOUNDS = {
    answer: 'Sounds/Answer.mp3',
    correct: 'Sounds/Correct.mp3',
    incorrect: 'Sounds/Incorrect.mp3'
};


/* =============================================================
   PROJECTOR VOLUME

   0 = Muted
   1 = Low
   2 = Medium
   3 = High
   ============================================================= */

const VOLUME_LEVELS = [
    {
        label: 'Muted',
        icon: '🔇',
        volume: 0
    },
    {
        label: 'Low',
        icon: '🔈',
        volume: 0.3
    },
    {
        label: 'Medium',
        icon: '🔉',
        volume: 0.65
    },
    {
        label: 'High',
        icon: '🔊',
        volume: 1
    }
];


function getVolumeLevel() {

    const stored =
        Number(
            localStorage.getItem(VOLUME_KEY)
        );

    if (
        Number.isInteger(stored) &&
        stored >= 0 &&
        stored < VOLUME_LEVELS.length
    ) {
        return stored;
    }

    return 3;
}


function setVolumeLevel(level) {

    localStorage.setItem(
        VOLUME_KEY,
        String(level)
    );
}


function currentVolume() {

    return VOLUME_LEVELS[
        getVolumeLevel()
    ].volume;
}


/* =============================================================
   PAGE TYPE
   ============================================================= */

function isHost() {

    return document.body
        .classList
        .contains('host');
}


function isProjector() {

    return document.body
        .classList
        .contains('projector');
}


/* =============================================================
   HELPERS
   ============================================================= */

const $ = (
    selector,
    root = document
) =>
    root.querySelector(selector);


const $$ = (
    selector,
    root = document
) =>
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


/* =============================================================
   FULLSCREEN
   ============================================================= */

function toggleFullscreen() {

    if (!document.fullscreenElement) {

        document.documentElement
            .requestFullscreen()
            .catch(() => {});

    } else {

        document.exitFullscreen()
            .catch(() => {});
    }
}


/* =============================================================
   PROJECTOR AUDIO
   ============================================================= */

function playProjectorSound(name) {

    if (!isProjector()) {
        return;
    }

    const file =
        SOUNDS[name];

    if (!file) {
        return;
    }

    const volume =
        currentVolume();

    if (volume <= 0) {
        return;
    }

    const audio =
        new Audio(file);

    audio.volume =
        volume;

    audio.play()
        .catch(
            error => {

                console.warn(
                    'CIT Feud audio was blocked by the browser.',
                    error
                );
            }
        );
}


/* =============================================================
   VOLUME TEST

   Used when changing projector volume so you can immediately
   confirm that sound is working.
   ============================================================= */

function testProjectorVolume() {

    if (!isProjector()) {
        return;
    }

    if (currentVolume() <= 0) {
        return;
    }

    playProjectorSound(
        'answer'
    );
}


/* =============================================================
   SAVE SLOTS
   ============================================================= */

function slots() {

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(KEY)
            );

        if (
            Array.isArray(stored)
        ) {

            while (
                stored.length < 3
            ) {
                stored.push(null);
            }

            return stored.slice(
                0,
                3
            );
        }

    } catch (error) {

        console.warn(
            'Unable to read CIT Feud save slots.',
            error
        );
    }

    return [
        null,
        null,
        null
    ];
}


function writeSlots(value) {

    localStorage.setItem(
        KEY,
        JSON.stringify(value)
    );
}


/* =============================================================
   LIVE GAME STATE
   ============================================================= */

function live() {

    try {

        return JSON.parse(
            localStorage.getItem(LIVE)
        );

    } catch {

        return null;
    }
}


/* =============================================================
   BROADCAST STATE
   ============================================================= */

function broadcast(game) {

    localStorage.setItem(
        LIVE,
        JSON.stringify(game)
    );

    if (bc) {

        bc.postMessage({
            type: 'state',
            game
        });
    }
}


/* =============================================================
   BROADCAST TRANSIENT EFFECT
   ============================================================= */

function broadcastEffect(
    effect,
    data = {}
) {

    if (!bc) {
        return;
    }

    bc.postMessage({
        type: 'effect',
        effect,
        data,
        stamp: Date.now()
    });
}


/* =============================================================
   SAVE GAME
   ============================================================= */

function save(game) {

    const savedSlots =
        slots();

    savedSlots[
        game.slot
    ] = game;

    writeSlots(
        savedSlots
    );

    broadcast(
        game
    );
}


/* =============================================================
   CREATE NEW GAME
   ============================================================= */

function fresh(
    slot,
    name,
    date,
    packs,
    teams
) {

    const questions =
        QUESTION_PACKS
            .filter(
                pack =>
                    packs.includes(
                        pack.id
                    )
            )
            .flatMap(
                pack =>
                    pack.questions.map(
                        question => ({
                            ...question,
                            pack: pack.title,
                            packId: pack.id
                        })
                    )
            );

    return {

        version: 4,

        slot,

        name,

        date,

        packs,

        teams:
            teams.map(
                (
                    teamName,
                    index
                ) => ({
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

        attemptLog: [],

        started:
            new Date()
                .toISOString(),

        updated:
            new Date()
                .toISOString()
    };
}


/* =============================================================
   NORMALIZE EXISTING GAME

   Old "top" presentation states are converted to the new Intro.
   ============================================================= */

function normalizeGame(game) {

    if (!game) {
        return game;
    }

    if (
        game.activeTeam === undefined
    ) {
        game.activeTeam =
            null;
    }

    if (
        !Array.isArray(
            game.attemptLog
        )
    ) {
        game.attemptLog =
            [];
    }

    if (
        !Array.isArray(
            game.revealed
        )
    ) {
        game.revealed =
            [];
    }

    if (
        !Array.isArray(
            game.teams
        )
    ) {
        game.teams =
            [];
    }

    if (!game.phase) {
        game.phase =
            'question';
    }

    if (
        game.phase ===
        'top'
    ) {
        game.phase =
            'round';
    }

    if (!game.round) {
        game.round =
            game.current + 1;
    }

    return game;
}


/* =============================================================
   MUTATE GAME
   ============================================================= */

function mutate(callback) {

    let game =
        normalizeGame(
            live()
        );

    if (!game) {
        return;
    }

    callback(game);

    game.updated =
        new Date()
            .toISOString();

    save(game);

    if (isHost()) {
        renderHostGame();
    }
}


/* =============================================================
   TAG DISPLAY
   ============================================================= */

function tags(
    tagArray = []
) {

    return `

        <div class="tags">

            ${
                tagArray
                    .slice(0, 3)
                    .map(
                        tag =>
                            `<span>${esc(tag)}</span>`
                    )
                    .join('')
            }

        </div>

    `;
}


/* =============================================================
   CROSS-WINDOW COMMUNICATION
   ============================================================= */

if (bc) {

    bc.onmessage =
        event => {

            const message =
                event.data;

            if (!isProjector()) {
                return;
            }

            if (
                message?.type ===
                'state'
            ) {
                renderProjector(
                    message.game
                );
            }

            if (
                message?.type ===
                'effect'
            ) {
                runProjectorEffect(
                    message.effect,
                    message.data
                );
            }
        };
}


/* =============================================================
   STORAGE FALLBACK
   ============================================================= */

window.addEventListener(
    'storage',
    event => {

        if (
            event.key === LIVE &&
            isProjector()
        ) {
            renderProjector(
                live()
            );
        }
    }
);


/* =============================================================
   HOST HOME
   ============================================================= */

function renderHostHome() {

    const root =
        $('#hostApp');

    if (!root) {
        return;
    }

    const savedSlots =
        slots();

    root.innerHTML = `

        <section class="startup">

            <div class="hostUtilityBar">

                <button
                    class="iconUtility"
                    id="hostFullscreen"
                    title="Fullscreen"
                >
                    ⛶
                </button>

            </div>


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
                        Saved Games
                    </h2>

                    <p>
                        Resume a previous game or start a new one.
                    </p>


                    <div class="slots">

                        ${
                            savedSlots.map(
                                (
                                    game,
                                    index
                                ) => {

                                    if (game) {

                                        return `

                                            <article class="savecard">

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

                                                        ${
                                                            Array.isArray(
                                                                game.teams
                                                            )
                                                                ? game.teams.length
                                                                : 0
                                                        }
                                                        teams

                                                        ·

                                                        Question
                                                        ${(game.current || 0) + 1}
                                                        /
                                                        ${
                                                            Array.isArray(
                                                                game.questions
                                                            )
                                                                ? game.questions.length
                                                                : 0
                                                        }

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

                                        `;

                                    }

                                    return `

                                        <article class="savecard empty">

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

                                    `;
                                }
                            ).join('')
                        }

                    </div>

                </div>


                <div class="panel help">

                    <h2>
                        Projector Setup
                    </h2>

                    <ol>

                        <li>
                            Keep this control room on your laptop.
                        </li>

                        <li>
                            Open the projector board.
                        </li>

                        <li>
                            Move the projector window to your second display.
                        </li>

                        <li>
                            Use the volume control on the projector to set and test game audio.
                        </li>

                        <li>
                            Use fullscreen on either screen whenever needed.
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


    $('#hostFullscreen').onclick =
        toggleFullscreen;


    $$('[data-resume]')
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const game =
                            normalizeGame(
                                savedSlots[
                                    +button.dataset.resume
                                ]
                            );

                        broadcast(
                            game
                        );

                        renderHostGame();
                    };
            }
        );


    $$('[data-new]')
        .forEach(
            button => {

                button.onclick =
                    () =>
                        renderSetup(
                            +button.dataset.new
                        );
            }
        );


    $$('[data-delete]')
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const index =
                            +button.dataset.delete;

                        if (
                            confirm(
                                'Delete this saved game?'
                            )
                        ) {

                            savedSlots[
                                index
                            ] = null;

                            writeSlots(
                                savedSlots
                            );

                            renderHostHome();
                        }
                    };
            }
        );
}


/* =============================================================
   NEW GAME SETUP
   ============================================================= */

function renderSetup(slot) {

    const root =
        $('#hostApp');

    if (!root) {
        return;
    }

    root.innerHTML = `

        <section class="startup">

            <div class="hostUtilityBar">

                <button
                    class="iconUtility"
                    id="setupFullscreen"
                    title="Fullscreen"
                >
                    ⛶
                </button>

            </div>


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

                        Game Name

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


                <h2>
                    Question Packs
                </h2>

                <p>
                    Select one or multiple question packs.
                </p>


                <div class="packgrid">

                    ${
                        QUESTION_PACKS.length

                            ? QUESTION_PACKS
                                .map(
                                    (
                                        pack,
                                        index
                                    ) => `

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
                                                    ${esc(pack.description)}
                                                </p>

                                                ${tags(pack.tags)}

                                                <small>

                                                    ${
                                                        Array.isArray(
                                                            pack.questions
                                                        )
                                                            ? pack.questions.length
                                                            : 0
                                                    }

                                                    questions

                                                </small>

                                            </div>

                                        </label>

                                    `
                                )
                                .join('')

                            : `

                                <div class="packcard">

                                    <h3>
                                        No Game Packs Found
                                    </h3>

                                    <p>
                                        Check that the GamePacks files are loaded before script.js.
                                    </p>

                                </div>

                            `
                    }

                </div>


                <h2>
                    Teams
                </h2>


                <div class="formrow">

                    <label>

                        Number of Teams

                        <select id="teamCount">

                            <option value="2">
                                2
                            </option>

                            <option value="3">
                                3
                            </option>

                            <option
                                value="4"
                                selected
                            >
                                4
                            </option>

                            <option value="5">
                                5
                            </option>

                            <option value="6">
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


    $('#setupFullscreen').onclick =
        toggleFullscreen;


    const teamCount =
        $('#teamCount');


    function renderTeamNames() {

        const count =
            +teamCount.value;

        const existing =
            $$(
                'input[name=teamName]'
            )
            .map(
                input =>
                    input.value
            );

        $('#teamNames').innerHTML = `

            <div class="teaminputs">

                ${
                    Array.from(
                        {
                            length: count
                        },
                        (
                            _,
                            index
                        ) => `

                            <label>

                                Team ${index + 1} Name

                                <input
                                    name="teamName"
                                    value="${esc(
                                        existing[index] ||
                                        `Team ${index + 1}`
                                    )}"
                                    maxlength="24"
                                >

                            </label>

                        `
                    ).join('')
                }

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
                    'input[name=pack]:checked'
                )
                .map(
                    input =>
                        input.value
                );


            const teamNames =
                $$(
                    'input[name=teamName]'
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
                    teamNames
                );


            if (
                !game.questions.length
            ) {

                alert(
                    'Select at least one question pack that contains questions.'
                );

                return;
            }


            save(
                game
            );


            renderHostGame();
        };
}


/* =============================================================
   PRESENTATION PHASE LABEL
   ============================================================= */

function phaseLabel(phase) {

    switch (phase) {

        case 'round':
            return 'Intro';

        case 'board':
            return 'Board';

        case 'question':
            return 'Board + Question';

        default:
            return 'Intro';
    }
}


/* =============================================================
   ADVANCE TO NEXT ROUND
   ============================================================= */

function nextRound() {

    const game =
        normalizeGame(
            live()
        );

    if (!game) {
        return;
    }


    if (
        game.current >=
        game.questions.length - 1
    ) {

        alert(
            'This is the final round.'
        );

        return;
    }


    mutate(
        game => {

            game.current++;

            game.round =
                game.current + 1;

            game.phase =
                'round';

            game.revealed =
                [];

            game.strikes =
                0;

            game.bank =
                0;

            game.activeTeam =
                null;

            game.attemptLog =
                [];
        }
    );
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


    if (
        !Array.isArray(
            game.questions
        ) ||
        !game.questions.length
    ) {

        alert(
            'This saved game does not contain any questions.'
        );

        renderHostHome();

        return;
    }


    const question =
        game.questions[
            game.current
        ];


    if (!question) {

        renderHostHome();

        return;
    }


    const root =
        $('#hostApp');


    if (!root) {
        return;
    }


    const isFinalRound =
        game.current >=
        game.questions.length - 1;


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

                        Round ${game.round}

                        ·

                        Question
                        ${game.current + 1}
                        of
                        ${game.questions.length}

                        ·

                        ${esc(
                            question.pack || ''
                        )}

                    </p>

                </div>


                <div class="controlTopActions">

                    <div class="saveok">
                        ✓ Autosaved
                    </div>

                    <button
                        class="iconUtility"
                        id="gameFullscreen"
                        title="Fullscreen"
                    >
                        ⛶
                    </button>

                </div>

            </header>


            <div class="presentationControl panel">

                <div>

                    <div class="sectionlabel">
                        PROJECTOR PRESENTATION
                    </div>

                    <strong>
                        Round ${game.round}
                    </strong>

                </div>


                <div class="presentationButtons">

                    <button
                        id="showRound"
                        class="${
                            game.phase ===
                            'round'
                                ? ''
                                : 'ghost'
                        }"
                    >
                        Intro
                    </button>


                    <button
                        id="showBoard"
                        class="${
                            game.phase ===
                            'board'
                                ? ''
                                : 'ghost'
                        }"
                    >
                        Board
                    </button>


                    <button
                        id="showQuestion"
                        class="${
                            game.phase ===
                            'question'
                                ? ''
                                : 'ghost'
                        }"
                    >
                        Board + Question
                    </button>


                    <button
                        id="nextRound"
                        class="presentationNext"
                        ${
                            isFinalRound
                                ? 'disabled'
                                : ''
                        }
                    >
                        ${
                            isFinalRound
                                ? 'Final Round'
                                : 'Next Round →'
                        }
                    </button>

                </div>

            </div>


            <div class="controlgrid">


                <section class="panel boardcontrol">


                    <div class="qmeta">

                        ${tags(
                            question.tags
                        )}

                        <small>
                            ${esc(
                                question.title
                            )}
                        </small>

                    </div>


                    <h2>
                        ${esc(
                            question.prompt
                        )}
                    </h2>


                    <div class="buzzsection">

                        <div class="sectionlabel">
                            WHO IS ANSWERING?
                        </div>


                        <div
                            class="buzzteams"
                            style="
                                grid-template-columns:
                                repeat(
                                    ${Math.min(
                                        game.teams.length,
                                        3
                                    )},
                                    minmax(0,1fr)
                                );
                            "
                        >

                            ${
                                game.teams.map(
                                    (
                                        team,
                                        index
                                    ) => `

                                        <button
                                            class="
                                                buzzbtn
                                                ${
                                                    game.activeTeam === index
                                                        ? 'active'
                                                        : ''
                                                }
                                            "
                                            data-buzz="${index}"
                                        >

                                            <span>
                                                ${index + 1}
                                            </span>

                                            ${esc(
                                                team.name
                                            )}

                                        </button>

                                    `
                                ).join('')
                            }

                        </div>

                    </div>


                    <div class="sectionlabel answerlabel">
                        ANSWER BOARD · HOST VIEW
                    </div>


                    <div class="answerjudge">

                        ${
                            question.answers.map(
                                (
                                    answer,
                                    index
                                ) => `

                                    <div
                                        class="
                                            judgeRow
                                            ${
                                                game.revealed.includes(
                                                    index
                                                )
                                                    ? 'correct'
                                                    : ''
                                            }
                                        "
                                    >

                                        <span class="answerNum">
                                            ${index + 1}
                                        </span>

                                        <b>
                                            ${esc(
                                                answer[0]
                                            )}
                                        </b>

                                        <em>
                                            ${answer[1]} pts
                                        </em>

                                        <button
                                            class="judge yes"
                                            data-correct="${index}"
                                            title="Correct"
                                        >
                                            ✓
                                        </button>

                                        <button
                                            class="judge no"
                                            data-wrong="${index}"
                                            title="Incorrect"
                                        >
                                            ✕
                                        </button>

                                    </div>

                                `
                            ).join('')
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
                                game.current ===
                                game.questions.length - 1
                                    ? 'disabled'
                                    : ''
                            }
                        >
                            Next →
                        </button>

                    </div>

                </section>


                <aside class="panel scorepanel">

                    <h2>
                        Teams
                    </h2>


                    <div class="teamscorelist">

                        ${
                            game.teams.map(
                                (
                                    team,
                                    index
                                ) => `

                                    <div
                                        class="
                                            teamctl
                                            ${
                                                game.activeTeam === index
                                                    ? 'answering'
                                                    : ''
                                            }
                                        "
                                    >

                                        <div class="hostTeamHeader">

                                            <input
                                                value="${esc(
                                                    team.name
                                                )}"
                                                data-teamname="${index}"
                                                maxlength="24"
                                            >

                                            <strong>
                                                ${team.score}
                                            </strong>

                                        </div>


                                        <div class="teamScoreButtons">

                                            <button
                                                data-award="${index}"
                                            >
                                                + Bank
                                            </button>

                                            <button
                                                class="ghost"
                                                data-adjust="${index}"
                                                data-delta="10"
                                            >
                                                +10
                                            </button>

                                            <button
                                                class="ghost"
                                                data-adjust="${index}"
                                                data-delta="-10"
                                            >
                                                −10
                                            </button>

                                        </div>

                                    </div>

                                `
                            ).join('')
                        }

                    </div>


                    <div class="strikectl">

                        <span>
                            Strikes
                        </span>


                        <div class="xs">

                            ${
                                '✕'.repeat(
                                    game.strikes
                                )
                            }

                            ${
                                '○'.repeat(
                                    Math.max(
                                        0,
                                        3 - game.strikes
                                    )
                                )
                            }

                        </div>


                        <button
                            id="addStrike"
                        >
                            Manual Strike
                        </button>


                        <button
                            id="clearStrike"
                            class="ghost"
                        >
                            Clear
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
                                                    ${esc(
                                                        attempt.team
                                                    )}
                                                </b>

                                                <small>

                                                    ${
                                                        attempt.ok
                                                            ? esc(
                                                                attempt.answer
                                                            )
                                                            : 'Strike'
                                                    }

                                                </small>

                                            </div>

                                        `
                                    )
                                    .join('')

                                : `

                                    <p class="microcopy">
                                        Correct answers and strikes will appear here.
                                    </p>

                                `
                        }

                    </div>


                    <div class="facilitator">

                        <h3>
                            Facilitator Note
                        </h3>

                        <p>
                            ${esc(
                                question.note || ''
                            )}
                        </p>

                    </div>


                    <div class="hostfooter">

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


    /* =========================================================
       FULLSCREEN
       ========================================================= */

    $('#gameFullscreen').onclick =
        toggleFullscreen;


    /* =========================================================
       PROJECTOR PRESENTATION CONTROLS
       ========================================================= */

    $('#showRound').onclick =
        () =>
            mutate(
                game => {
                    game.phase =
                        'round';
                }
            );


    $('#showBoard').onclick =
        () =>
            mutate(
                game => {
                    game.phase =
                        'board';
                }
            );


    $('#showQuestion').onclick =
        () =>
            mutate(
                game => {
                    game.phase =
                        'question';
                }
            );


    $('#nextRound').onclick =
        nextRound;


    /* =========================================================
       ANSWERING TEAM / BUZZER
       ========================================================= */

    $$('[data-buzz]')
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const index =
                            +button.dataset.buzz;

                        const currentGame =
                            live();

                        const selectingTeam =
                            currentGame?.activeTeam !==
                            index;

                        mutate(
                            game => {

                                game.activeTeam =
                                    game.activeTeam ===
                                    index
                                        ? null
                                        : index;
                            }
                        );

                        if (
                            selectingTeam
                        ) {

                            broadcastEffect(
                                'buzzer',
                                {
                                    team: index
                                }
                            );
                        }
                    };
            }
        );


    /* =========================================================
       CORRECT ANSWER
       ========================================================= */

    $$('[data-correct]')
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const index =
                            +button.dataset.correct;

                        const currentGame =
                            live();

                        if (
                            currentGame?.revealed?.includes(
                                index
                            )
                        ) {
                            return;
                        }

                        mutate(
                            game => {

                                const question =
                                    game.questions[
                                        game.current
                                    ];

                                game.revealed.push(
                                    index
                                );

                                game.bank =
                                    game.revealed.reduce(
                                        (
                                            total,
                                            answerIndex
                                        ) =>
                                            total +
                                            (
                                                question.answers[
                                                    answerIndex
                                                ]?.[1] ||
                                                0
                                            ),
                                        0
                                    );

                                game.attemptLog.push({

                                    ok: true,

                                    team:
                                        game.activeTeam !==
                                        null

                                            ? game.teams[
                                                game.activeTeam
                                            ].name

                                            : 'Unassigned',

                                    answer:
                                        question.answers[
                                            index
                                        ][0],

                                    time:
                                        Date.now()
                                });
                            }
                        );

                        broadcastEffect(
                            'correct',
                            {
                                answerIndex: index
                            }
                        );
                    };
            }
        );


    /* =========================================================
       WRONG ANSWER
       ========================================================= */

    $$('[data-wrong]')
        .forEach(
            button => {

                button.onclick =
                    () => {

                        mutate(
                            game => {

                                game.strikes =
                                    Math.min(
                                        3,
                                        game.strikes + 1
                                    );

                                game.attemptLog.push({

                                    ok: false,

                                    team:
                                        game.activeTeam !==
                                        null

                                            ? game.teams[
                                                game.activeTeam
                                            ].name

                                            : 'Unassigned',

                                    time:
                                        Date.now()
                                });
                            }
                        );

                        broadcastEffect(
                            'wrong'
                        );
                    };
            }
        );


    /* =========================================================
       AWARD BANK
       ========================================================= */

    $$('[data-award]')
        .forEach(
            button => {

                button.onclick =
                    () =>
                        mutate(
                            game => {

                                game.teams[
                                    +button.dataset.award
                                ].score +=
                                    game.bank;
                            }
                        );
            }
        );


    /* =========================================================
       MANUAL SCORE ADJUSTMENTS
       ========================================================= */

    $$('[data-adjust]')
        .forEach(
            button => {

                button.onclick =
                    () =>
                        mutate(
                            game => {

                                const team =
                                    game.teams[
                                        +button.dataset.adjust
                                    ];

                                team.score =
                                    Math.max(
                                        0,
                                        team.score +
                                        (
                                            +button.dataset.delta
                                        )
                                    );
                            }
                        );
            }
        );


    /* =========================================================
       TEAM NAMES
       ========================================================= */

    $$('[data-teamname]')
        .forEach(
            input => {

                input.onchange =
                    () =>
                        mutate(
                            game => {

                                const index =
                                    +input.dataset.teamname;

                                game.teams[
                                    index
                                ].name =
                                    input.value.trim() ||
                                    `Team ${index + 1}`;
                            }
                        );
            }
        );


    /* =========================================================
       MANUAL STRIKE
       ========================================================= */

    $('#addStrike').onclick =
        () => {

            mutate(
                game => {

                    game.strikes =
                        Math.min(
                            3,
                            game.strikes + 1
                        );

                    game.attemptLog.push({

                        ok: false,

                        team:
                            game.activeTeam !==
                            null

                                ? game.teams[
                                    game.activeTeam
                                ].name

                                : 'Unassigned',

                        time:
                            Date.now()
                    });
                }
            );

            broadcastEffect(
                'wrong'
            );
        };


    /* =========================================================
       CLEAR STRIKES
       ========================================================= */

    $('#clearStrike').onclick =
        () =>
            mutate(
                game => {
                    game.strikes =
                        0;
                }
            );


    /* =========================================================
       RESET QUESTION
       ========================================================= */

    $('#resetRound').onclick =
        () => {

            if (
                !confirm(
                    'Reset this question? Revealed answers, strikes and the round presentation will reset.'
                )
            ) {
                return;
            }

            mutate(
                game => {

                    game.phase =
                        'round';

                    game.revealed =
                        [];

                    game.strikes =
                        0;

                    game.bank =
                        0;

                    game.activeTeam =
                        null;

                    game.attemptLog =
                        [];
                }
            );
        };


    /* =========================================================
       PREVIOUS QUESTION
       ========================================================= */

    $('#prevQ').onclick =
        () =>
            mutate(
                game => {

                    if (
                        game.current <=
                        0
                    ) {
                        return;
                    }

                    game.current--;

                    game.round =
                        game.current + 1;

                    game.phase =
                        'round';

                    game.revealed =
                        [];

                    game.strikes =
                        0;

                    game.bank =
                        0;

                    game.activeTeam =
                        null;

                    game.attemptLog =
                        [];
                }
            );


    /* =========================================================
       NEXT QUESTION
       ========================================================= */

    $('#nextQ').onclick =
        nextRound;


    /* =========================================================
       OPEN PROJECTOR
       ========================================================= */

    $('#openProjector').onclick =
        () =>
            window.open(
                'index.html',
                'citfeudprojector'
            );


    /* =========================================================
       SAVED GAMES
       ========================================================= */

    $('#homeBtn').onclick =
        renderHostHome;


    broadcast(
        game
    );
}


/* =============================================================
   PROJECTOR EFFECTS

   THIS IS THE ONLY SECTION THAT PLAYS GAME AUDIO.
   ============================================================= */

function runProjectorEffect(
    effect,
    data = {}
) {

    if (!isProjector()) {
        return;
    }


    /* =========================================================
       WRONG
       ========================================================= */

    if (
        effect ===
        'wrong'
    ) {

        playProjectorSound(
            'incorrect'
        );


        const existing =
            document.querySelector(
                '.wrongOverlay'
            );

        if (existing) {
            existing.remove();
        }


        const overlay =
            document.createElement(
                'div'
            );

        overlay.className =
            'wrongOverlay';

        overlay.innerHTML = `

            <div class="giantX">
                ✕
            </div>

        `;

        document.body.appendChild(
            overlay
        );

        setTimeout(
            () =>
                overlay.remove(),
            900
        );
    }


    /* =========================================================
       CORRECT
       ========================================================= */

    if (
        effect ===
        'correct'
    ) {

        playProjectorSound(
            'correct'
        );


        const tile =
            document.querySelector(
                `[data-projector-answer="${data.answerIndex}"]`
            );

        if (tile) {

            tile.classList.remove(
                'correctFlash'
            );

            void tile.offsetWidth;

            tile.classList.add(
                'correctFlash'
            );

            setTimeout(
                () =>
                    tile.classList.remove(
                        'correctFlash'
                    ),
                1000
            );
        }
    }


    /* =========================================================
       BUZZER / ANSWERING TEAM
       ========================================================= */

    if (
        effect ===
        'buzzer'
    ) {

        playProjectorSound(
            'answer'
        );


        const team =
            document.querySelector(
                `[data-projector-team="${data.team}"]`
            );

        if (team) {

            team.classList.remove(
                'buzzerFlash'
            );

            void team.offsetWidth;

            team.classList.add(
                'buzzerFlash'
            );

            setTimeout(
                () =>
                    team.classList.remove(
                        'buzzerFlash'
                    ),
                650
            );
        }
    }
}


/* =============================================================
   PROJECTOR
   ============================================================= */

function renderProjector(
    game = live()
) {

    const root =
        $('#projectorApp');

    if (!root) {
        return;
    }


    game =
        normalizeGame(
            game
        );


    /* =========================================================
       WAITING SCREEN
       ========================================================= */

    if (!game) {

        root.innerHTML = `

            <section class="waiting">

                <div class="eyebrow">
                    CRISIS INTERVENTION TRAINING
                </div>

                <h1>
                    CIT <b>FEUD</b>
                </h1>

                <p>
                    Waiting for the host to start or resume a game…
                </p>

            </section>

        `;

        return;
    }


    if (
        !Array.isArray(
            game.questions
        ) ||
        !game.questions.length
    ) {

        root.innerHTML = `

            <section class="waiting">

                <div class="eyebrow">
                    CRISIS INTERVENTION TRAINING
                </div>

                <h1>
                    CIT <b>FEUD</b>
                </h1>

                <p>
                    This game does not contain any questions.
                </p>

            </section>

        `;

        return;
    }


    const question =
        game.questions[
            game.current
        ];


    if (!question) {
        return;
    }


    /* =========================================================
       ROUND INTRO

       The old "Top Answers" screen has been removed.

       Intro now shows:
       ROUND #
       TOP # ANSWERS ON THE BOARD
       ========================================================= */

    if (
        game.phase ===
        'round'
    ) {

        root.innerHTML = `

            <section class="roundIntro">

                <div class="eyebrow">
                    CRISIS INTERVENTION TRAINING
                </div>

                <div class="roundWord">
                    ROUND
                </div>

                <div class="roundNumber">
                    ${game.round}
                </div>

                <div class="roundPack">
                    TOP ${question.answers.length} ANSWERS ON THE BOARD
                </div>

            </section>

        `;

        return;
    }


    /* =========================================================
       BOARD / BOARD + QUESTION
       ========================================================= */

    const showQuestion =
        game.phase ===
        'question';


    root.innerHTML = `

        <section class="stage">


            <!-- ===============================================
                 TOP BAR
                 =============================================== -->

            <header class="gameTopBar">


                <div class="miniBrand">

                    <div class="eyebrow">
                        CRISIS INTERVENTION TRAINING
                    </div>

                    <strong>
                        CIT <b>FEUD</b>
                    </strong>

                </div>


                <!-- ===========================================
                     STRIKES
                     =========================================== -->

                <div class="topStrikeArea">

                    <span class="strikeLabel">
                        STRIKES
                    </span>


                    <div class="topStrikes">

                        ${
                            Array.from(
                                {
                                    length: 3
                                },
                                (
                                    _,
                                    index
                                ) => `

                                    <span
                                        class="
                                            ${
                                                index <
                                                game.strikes
                                                    ? 'hot'
                                                    : ''
                                            }
                                        "
                                    >
                                        ✕
                                    </span>

                                `
                            ).join('')
                        }

                    </div>

                </div>


                <div class="roundbadge">

                    ROUND ${game.round}

                    <small>
                        ${esc(
                            question.title
                        )}
                    </small>

                </div>

            </header>


            <!-- ===============================================
                 QUESTION
                 =============================================== -->

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

                        ? esc(
                            question.prompt
                        )

                        : '&nbsp;'
                }

            </div>


            <!-- ===============================================
                 ANSWER BOARD
                 =============================================== -->

            <div class="projectorAnswers">

                ${
                    question.answers.map(
                        (
                            answer,
                            index
                        ) => `

                            <div
                                data-projector-answer="${index}"
                                class="
                                    tile
                                    ${
                                        game.revealed.includes(
                                            index
                                        )
                                            ? 'revealed'
                                            : ''
                                    }
                                "
                            >

                                <span>
                                    ${index + 1}
                                </span>

                                <b>

                                    ${
                                        game.revealed.includes(
                                            index
                                        )

                                            ? esc(
                                                answer[0]
                                            )

                                            : ''
                                    }

                                </b>

                                <em>

                                    ${
                                        game.revealed.includes(
                                            index
                                        )

                                            ? answer[1]

                                            : ''
                                    }

                                </em>

                            </div>

                        `
                    ).join('')
                }

            </div>


            <!-- ===============================================
                 ROUND BANK
                 =============================================== -->

            <div class="projectorBank">

                <span>
                    ROUND
                </span>

                <strong>
                    ${game.bank}
                </strong>

            </div>


            <!-- ===============================================
                 TEAMS
                 =============================================== -->

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
                    game.teams.map(
                        (
                            team,
                            index
                        ) => `

                            <div
                                data-projector-team="${index}"
                                class="
                                    projectorTeam
                                    ${
                                        game.activeTeam ===
                                        index
                                            ? 'activeAnswerer'
                                            : ''
                                    }
                                "
                            >

                                <span>
                                    ${esc(
                                        team.name
                                    )}
                                </span>

                                <strong>
                                    ${team.score}
                                </strong>

                            </div>

                        `
                    ).join('')
                }

            </footer>

        </section>

    `;
}


/* =============================================================
   PROJECTOR UTILITY CONTROLS

   Bottom-left:
   Host/Admin
   Volume
   Fullscreen
   ============================================================= */

function createProjectorUtilities() {

    if (!isProjector()) {
        return;
    }


    if (
        document.querySelector(
            '.projectorUtilities'
        )
    ) {
        return;
    }


    const utilities =
        document.createElement(
            'div'
        );


    utilities.className =
        'projectorUtilities';


    utilities.innerHTML = `

        <a
            href="host.html"
            target="_blank"
            rel="noopener"
            class="projectorUtilityButton"
            title="Open Host Controls"
            aria-label="Open Host Controls"
        >

            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >

                <circle
                    cx="12"
                    cy="8"
                    r="4"
                ></circle>

                <path
                    d="M4.5 20c.7-4.2 3.2-6.3 7.5-6.3s6.8 2.1 7.5 6.3"
                ></path>

            </svg>

            <span class="utilityGear">
                ⚙
            </span>

        </a>


        <button
            class="projectorUtilityButton"
            id="projectorVolume"
            title="Change Volume"
            aria-label="Change Volume"
        >
            ${VOLUME_LEVELS[getVolumeLevel()].icon}
        </button>


        <button
            class="projectorUtilityButton"
            id="projectorFullscreen"
            title="Fullscreen"
            aria-label="Fullscreen"
        >
            ⛶
        </button>

    `;


    document.body.appendChild(
        utilities
    );


    $('#projectorFullscreen').onclick =
        toggleFullscreen;


    updateVolumeButton();


    $('#projectorVolume').onclick =
        cycleProjectorVolume;
}


/* =============================================================
   UPDATE VOLUME BUTTON
   ============================================================= */

function updateVolumeButton() {

    const button =
        $('#projectorVolume');

    if (!button) {
        return;
    }


    const level =
        VOLUME_LEVELS[
            getVolumeLevel()
        ];


    button.textContent =
        level.icon;


    button.title =
        `Volume: ${level.label} · Click to change`;


    button.setAttribute(
        'aria-label',
        `Volume: ${level.label}. Click to change.`
    );
}


/* =============================================================
   CYCLE PROJECTOR VOLUME

   Muted → Low → Medium → High → Muted

   Clicking this button also creates a direct browser interaction,
   which helps browsers permit projector audio.

   When a non-muted level is selected, Answer.mp3 plays once as
   the volume test.
   ============================================================= */

function cycleProjectorVolume() {

    const current =
        getVolumeLevel();


    const next =
        (
            current + 1
        ) % VOLUME_LEVELS.length;


    setVolumeLevel(
        next
    );


    updateVolumeButton();


    if (
        VOLUME_LEVELS[
            next
        ].volume > 0
    ) {

        testProjectorVolume();
    }
}


/* =============================================================
   PROJECTOR AUDIO PREPARATION

   Any interaction with the projector helps unlock browser audio.
   The dedicated volume button is the preferred way to test it.
   ============================================================= */

function prepareProjectorAudio() {

    if (!isProjector()) {
        return;
    }


    let prepared =
        false;


    const prepare =
        () => {

            if (prepared) {
                return;
            }


            prepared =
                true;


            Object.values(
                SOUNDS
            )
            .forEach(
                file => {

                    const audio =
                        new Audio(file);


                    audio.volume =
                        0;


                    audio.play()
                        .then(
                            () => {

                                audio.pause();

                                audio.currentTime =
                                    0;
                            }
                        )
                        .catch(
                            () => {}
                        );
                }
            );


            window.removeEventListener(
                'pointerdown',
                prepare
            );


            window.removeEventListener(
                'keydown',
                prepare
            );
        };


    window.addEventListener(
        'pointerdown',
        prepare,
        {
            once: true
        }
    );


    window.addEventListener(
        'keydown',
        prepare,
        {
            once: true
        }
    );
}


/* =============================================================
   STARTUP
   ============================================================= */

if (isHost()) {

    renderHostHome();

} else if (isProjector()) {

    renderProjector();

    createProjectorUtilities();

    prepareProjectorAudio();
}
