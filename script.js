/* =============================================================
   CIT FEUD
   COMPLETE JAVASCRIPT
   ============================================================= */


/* =============================================================
   QUESTION PACK LIBRARY

   EDIT YOUR PACKS, QUESTIONS, ANSWERS, POINTS AND NOTES HERE.

   PACK TAGS:
   tags: ['Tag 1', 'Tag 2', 'Tag 3']

   QUESTION TAGS:
   tags: ['Tag 1', 'Tag 2', 'Tag 3']

   ANSWER FORMAT:
   ['Answer Text', Point Value]

   ============================================================= */

const QUESTION_PACKS = [

    /* =========================================================
       PACK 1
       SUICIDE SAFETY PLANNING
       ========================================================= */

    {
        id: 'safety',

        title: 'Suicide Safety Planning',

        description:
            'Build a practical, collaborative safety plan from warning signs through environmental safety.',

        tags: [
            'Suicide',
            'Safety Planning',
            'CIT'
        ],

        questions: [

            {
                id: 'warn',

                title: 'Warning Signs',

                prompt:
                    "Name a warning sign that someone's mental health crisis may be getting worse.",

                tags: [
                    'Warning Signs',
                    'Assessment',
                    'Suicide'
                ],

                note:
                    'A safety plan starts with the patient’s own warning signs, not only what responders observe.',

                answers: [
                    ['Talking about suicide or death', 30],
                    ['Isolation / withdrawal', 25],
                    ['Increased substance use', 20],
                    ['Major mood or behavior change', 15],
                    ['Giving things away / saying goodbye', 12],
                    ['Sleep changes', 10],
                    ['Agitation / anger', 8],
                    ['Stopping normal routines', 5]
                ]
            },

            {
                id: 'cope',

                title: 'Internal Coping',

                prompt:
                    'Name something someone could do by themselves to get through a difficult moment.',

                tags: [
                    'Coping',
                    'Safety Plan',
                    'Skills'
                ],

                note:
                    'Internal coping creates an immediate layer before the person needs to involve someone else.',

                answers: [
                    ['Listen to music', 25],
                    ['Walk / exercise', 20],
                    ['Watch a show or movie', 15],
                    ['Breathing / grounding', 15],
                    ['Spend time with a pet', 10],
                    ['Game / puzzle', 8],
                    ['Shower / self-care', 5],
                    ['Art / journal / hobby', 5]
                ]
            },

            {
                id: 'distract',

                title: 'People & Places',

                prompt:
                    'Name a person or place that could provide distraction from a crisis.',

                tags: [
                    'Social Support',
                    'Distraction',
                    'Safety Plan'
                ],

                note:
                    'Social distraction does not always require disclosing suicidal thoughts. Sometimes the goal is simply not being alone.',

                answers: [
                    ['Friend', 25],
                    ['Family member', 20],
                    ['Coffee shop / restaurant', 15],
                    ['Gym / recreation', 12],
                    ['Park / public space', 10],
                    ['Work / school', 8],
                    ['Faith / community space', 6],
                    ['Neighbor', 4]
                ]
            },

            {
                id: 'help',

                title: 'People Who Can Help',

                prompt:
                    "Name someone you could actually tell, 'I'm not safe right now.'",

                tags: [
                    'Help Seeking',
                    'Support',
                    'Safety Plan'
                ],

                note:
                    'Someone who is good company is not automatically someone the patient trusts with a crisis disclosure.',

                answers: [
                    ['Spouse / partner', 25],
                    ['Close friend', 22],
                    ['Parent', 18],
                    ['Sibling / family', 15],
                    ['Coworker / supervisor', 8],
                    ['Peer', 5],
                    ['Teacher / coach', 4],
                    ['Neighbor', 3]
                ]
            },

            {
                id: 'professional',

                title: 'Professional Resources',

                prompt:
                    'Name a professional or service someone could contact during a mental health crisis.',

                tags: [
                    'Resources',
                    'Crisis',
                    'Professional'
                ],

                note:
                    'Match the resource to the need and urgency rather than treating every crisis identically.',

                answers: [
                    ['988', 25],
                    ['Therapist / counselor', 20],
                    ['911', 18],
                    ['Emergency department', 15],
                    ['Psychiatrist', 10],
                    ['Crisis response team', 8],
                    ['Primary care provider', 5],
                    ['Peer / recovery specialist', 4]
                ]
            },

            {
                id: 'safer',

                title: 'Safer Environment',

                prompt:
                    "Name something we could change to make someone's environment safer tonight.",

                tags: [
                    'Means Safety',
                    'Environment',
                    'Suicide'
                ],

                note:
                    'Environmental safety creates time and distance between a suicidal impulse and access to a lethal method.',

                answers: [
                    ['Firearm access', 30],
                    ['Medication access', 22],
                    ['Alcohol / drugs', 16],
                    ['Knives / sharps', 10],
                    ['Being alone', 8],
                    ['Vehicle / keys', 6],
                    ['Dangerous locations', 5],
                    ['Other identified means', 3]
                ]
            }

        ]
    },


    /* =========================================================
       PACK 2 PLACEHOLDER
       ========================================================= */

    {
        id: 'assessment',

        title: 'Crisis Assessment',

        description:
            'Placeholder pack for future CIT assessment questions.',

        tags: [
            'Assessment',
            'CIT',
            'Behavioral Health'
        ],

        questions: []
    },


    /* =========================================================
       PACK 3 PLACEHOLDER
       ========================================================= */

    {
        id: 'substance',

        title: 'Substance Use',

        description:
            'Placeholder pack for future substance-use and co-response questions.',

        tags: [
            'SUD',
            'Harm Reduction',
            'Co-Response'
        ],

        questions: []
    }

];


/* =============================================================
   STORAGE / SYNC SETTINGS
   ============================================================= */

const KEY = 'citFeudSlotsV3';

const LIVE = 'citFeudLiveV3';

const bc =
    ('BroadcastChannel' in window)
        ? new BroadcastChannel('cit-feud-v3')
        : null;


/* =============================================================
   BASIC HELPERS
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
   SAVE SLOT SYSTEM
   ============================================================= */

function slots() {

    try {

        return (
            JSON.parse(
                localStorage.getItem(KEY)
            )
            ||
            [
                null,
                null,
                null
            ]
        );

    } catch {

        return [
            null,
            null,
            null
        ];

    }

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
   BROADCAST GAME STATE
   ============================================================= */

function broadcast(game) {

    localStorage.setItem(
        LIVE,
        JSON.stringify(game)
    );

    if (bc) {

        bc.postMessage(game);

    }

}


/* =============================================================
   SAVE CURRENT GAME
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
                            pack: pack.title
                        })
                    )
            );


    return {

        version: 3,

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
                        teamName
                        ||
                        `Team ${index + 1}`,

                    score: 0

                })
            ),

        questions,

        current: 0,

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
   NORMALIZE SAVED GAME
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

    return game;

}


/* =============================================================
   CHANGE GAME STATE
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

    renderHostGame();

}


/* =============================================================
   BROADCAST WITHOUT CHANGING GAME
   ============================================================= */

function notify(game) {

    broadcast(game);

}


/* =============================================================
   CROSS-WINDOW SYNC
   ============================================================= */

if (bc) {

    bc.onmessage =
        event => {

            if (
                document.body
                    .classList
                    .contains('projector')
            ) {

                renderProjector(
                    event.data
                );

            }

        };

}


/* =============================================================
   LOCAL STORAGE FALLBACK SYNC
   ============================================================= */

window.addEventListener(
    'storage',
    event => {

        if (
            event.key === LIVE
            &&
            document.body
                .classList
                .contains('projector')
        ) {

            renderProjector(
                live()
            );

        }

    }
);


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
   HOST HOME PAGE
   ============================================================= */

function renderHostHome() {

    const root =
        $('#hostApp');

    const savedSlots =
        slots();


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

                                                        ${game.teams.length}
                                                        teams

                                                        ·

                                                        Question
                                                        ${game.current + 1}
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
                            Press F11 for fullscreen.
                        </li>

                        <li>
                            All game changes sync automatically.
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


    /* RESUME */

    $$(
        '[data-resume]'
    ).forEach(
        button => {

            button.onclick =
                () => {

                    const game =
                        normalizeGame(
                            savedSlots[
                                +button.dataset.resume
                            ]
                        );

                    broadcast(game);

                    renderHostGame();

                };

        }
    );


    /* NEW / REPLACE */

    $$(
        '[data-new]'
    ).forEach(
        button => {

            button.onclick =
                () =>
                    renderSetup(
                        +button.dataset.new
                    );

        }
    );


    /* DELETE */

    $$(
        '[data-delete]'
    ).forEach(
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
                        QUESTION_PACKS.map(
                            (
                                pack,
                                index
                            ) => `

                                <label class="packcard">

                                    <input
                                        type="checkbox"
                                        name="pack"
                                        value="${pack.id}"
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
                                            ${pack.questions.length}
                                            questions
                                        </small>

                                    </div>

                                </label>

                            `

                        ).join('')
                    }

                </div>


                <h2>
                    Teams
                </h2>


                <div class="formrow">

                    <label>

                        Number of Teams

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

                    <button
                        type="submit"
                    >
                        Start Game
                    </button>

                </div>

            </form>

        </section>

    `;


    const teamCount =
        $('#teamCount');


    function renderTeamNames() {

        const count =
            +teamCount.value;


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
                                    value="Team ${index + 1}"
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
                ).map(
                    input =>
                        input.value
                );


            const teamNames =
                $$(
                    'input[name=teamName]'
                ).map(
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


            save(game);

            renderHostGame();

        };

}


/* =============================================================
   HOST MODERATOR CONSOLE
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


                <div class="saveok">
                    ✓ Autosaved
                </div>

            </header>


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


                    <!-- WHO IS ANSWERING -->

                    <div class="buzzsection">

                        <div class="sectionlabel">
                            WHO IS ANSWERING?
                        </div>


                        <div class="buzzteams">

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


                        <p class="microcopy">

                            Select the team that raised their hand first.

                            The selected team will highlight on the projector.

                        </p>

                    </div>


                    <!-- ANSWER BOARD -->

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
                                            title="Correct answer"
                                        >
                                            ✓
                                        </button>

                                        <button
                                            class="judge no"
                                            data-wrong="${index}"
                                            title="Incorrect answer"
                                        >
                                            ✕
                                        </button>

                                    </div>

                                `

                            ).join('')
                        }

                    </div>


                    <!-- BANK -->

                    <div class="bankline">

                        <span>
                            Round Bank
                        </span>

                        <strong>
                            ${game.bank}
                        </strong>

                    </div>


                    <!-- NAVIGATION -->

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


                <!-- GAME CONTROL -->

                <aside class="panel scorepanel">

                    <h2>
                        Game Control
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

                                        <div>

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


                    <!-- STRIKES -->

                    <div class="strikectl">

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
                                game.activeTeam !== null

                                    ? `${esc(
                                        game.teams[
                                            game.activeTeam
                                        ].name
                                    )} is answering`

                                    : 'Select an answering team'
                            }

                        </p>


                        <button
                            id="addStrike"
                        >
                            Manual Strike
                        </button>


                        <button
                            id="clearStrike"
                            class="ghost"
                        >
                            Clear Strikes
                        </button>

                    </div>


                    <!-- RECENT CALLS -->

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

                                    ).join('')

                                : `

                                    <p class="microcopy">
                                        Correct answers and strikes will appear here.
                                    </p>

                                `
                        }

                    </div>


                    <!-- FACILITATOR NOTE -->

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
       SELECT ANSWERING TEAM
       ========================================================= */

    $$(
        '[data-buzz]'
    ).forEach(
        button => {

            button.onclick =
                () =>
                    mutate(
                        game => {

                            const index =
                                +button.dataset.buzz;

                            game.activeTeam =
                                game.activeTeam === index
                                    ? null
                                    : index;

                        }
                    );

        }
    );


    /* =========================================================
       CORRECT ANSWER
       ========================================================= */

    $$(
        '[data-correct]'
    ).forEach(
        button => {

            button.onclick =
                () =>
                    mutate(
                        game => {

                            const index =
                                +button.dataset.correct;

                            const question =
                                game.questions[
                                    game.current
                                ];


                            if (
                                !game.revealed.includes(
                                    index
                                )
                            ) {

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
                                                ]?.[1]
                                                ||
                                                0
                                            ),
                                        0
                                    );

                            }


                            game.attemptLog.push({

                                ok: true,

                                team:
                                    game.activeTeam !== null

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

        }
    );


    /* =========================================================
       WRONG ANSWER
       ========================================================= */

    $$(
        '[data-wrong]'
    ).forEach(
        button => {

            button.onclick =
                () =>
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
                                    game.activeTeam !== null

                                        ? game.teams[
                                            game.activeTeam
                                        ].name

                                        : 'Unassigned',

                                time:
                                    Date.now()

                            });

                        }
                    );

        }
    );


    /* =========================================================
       AWARD BANK
       ========================================================= */

    $$(
        '[data-award]'
    ).forEach(
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
       SCORE ADJUSTMENT
       ========================================================= */

    $$(
        '[data-adjust]'
    ).forEach(
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
       TEAM NAME
       ========================================================= */

    $$(
        '[data-teamname]'
    ).forEach(
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
                                input.value.trim()
                                ||
                                `Team ${index + 1}`;

                        }
                    );

        }
    );


    /* =========================================================
       MANUAL STRIKE
       ========================================================= */

    $('#addStrike').onclick =
        () =>
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
                            game.activeTeam !== null

                                ? game.teams[
                                    game.activeTeam
                                ].name

                                : 'Unassigned',

                        time:
                            Date.now()

                    });

                }
            );


    /* =========================================================
       CLEAR STRIKES
       ========================================================= */

    $('#clearStrike').onclick =
        () =>
            mutate(
                game => {

                    game.strikes = 0;

                }
            );


    /* =========================================================
       RESET QUESTION
       ========================================================= */

    $('#resetRound').onclick =
        () => {

            if (
                !confirm(
                    'Reset this question? Revealed answers and strikes will be cleared.'
                )
            ) {

                return;

            }


            mutate(
                game => {

                    game.revealed = [];

                    game.strikes = 0;

                    game.bank = 0;

                    game.activeTeam = null;

                    game.attemptLog = [];

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

                    game.current--;

                    game.revealed = [];

                    game.strikes = 0;

                    game.bank = 0;

                    game.activeTeam = null;

                    game.attemptLog = [];

                }
            );


    /* =========================================================
       NEXT QUESTION
       ========================================================= */

    $('#nextQ').onclick =
        () =>
            mutate(
                game => {

                    game.current++;

                    game.revealed = [];

                    game.strikes = 0;

                    game.bank = 0;

                    game.activeTeam = null;

                    game.attemptLog = [];

                }
            );


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
       HOME
       ========================================================= */

    $('#homeBtn').onclick =
        renderHostHome;


    notify(game);

}


/* =============================================================
   PROJECTOR DISPLAY
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


    /* =========================================================
       ACTIVE QUESTION
       ========================================================= */

    const question =
        game.questions[
            game.current
        ];


    root.innerHTML = `

        <section class="stage">


            <header>

                <div>

                    <div class="eyebrow">
                        CRISIS INTERVENTION TRAINING
                    </div>

                    <h1>
                        CIT <b>FEUD</b>
                    </h1>

                </div>


                <div class="roundbadge">

                    QUESTION
                    ${game.current + 1}

                    <small>
                        ${esc(
                            question.title
                        )}
                    </small>

                </div>

            </header>


            <!-- QUESTION -->

            <div class="prompt">

                ${esc(
                    question.prompt
                )}

            </div>


            <!-- ANSWERS -->

            <div class="projectorAnswers">

                ${
                    question.answers.map(
                        (
                            answer,
                            index
                        ) => `

                            <div
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


            <!-- STRIKES -->

            <div class="strikebar">

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


            <!-- SCORES -->

            <footer class="projectorScores">

                ${
                    game.teams.map(
                        (
                            team,
                            index
                        ) => `

                            <div
                                class="
                                    ${
                                        game.activeTeam === index
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

                                ${
                                    game.activeTeam === index

                                        ? `

                                            <small>
                                                ANSWERING
                                            </small>

                                        `

                                        : ''
                                }

                            </div>

                        `

                    ).join('')
                }

            </footer>


        </section>

    `;

}


/* =============================================================
   ADMIN / HOST ACCESS BUTTON

   This is intentionally generated by JavaScript.

   It appears ONLY on the projector page and remains available
   whether a game is active or not.

   Clicking it opens host.html in a new tab/window.
   ============================================================= */

function createAdminButton() {

    /* Only place this button on the projector page */

    if (
        !document.body
            .classList
            .contains('projector')
    ) {

        return;

    }


    /* Do not create duplicates */

    if (
        document.querySelector(
            '.admin-corner'
        )
    ) {

        return;

    }


    const button =
        document.createElement(
            'a'
        );


    button.href =
        'host.html';


    button.target =
        '_blank';


    button.rel =
        'noopener';


    button.className =
        'admin-corner';


    button.title =
        'Open Host Controls';


    button.setAttribute(
        'aria-label',
        'Open Host Controls'
    );


    /* =========================================================
       USER ICON

       SVG is used instead of an emoji so the icon looks the
       same across Windows, Chrome, Edge and the projector.
       ========================================================= */

    button.innerHTML = `

        <svg
            class="admin-user-icon"
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


        <span
            class="admin-settings-icon"
            aria-hidden="true"
        >
            ⚙
        </span>

    `;


    document.body.appendChild(
        button
    );

}


/* =============================================================
   PAGE STARTUP

   host.html:
   <body class="host">

   index.html:
   <body class="projector">
   ============================================================= */

if (
    document.body
        .classList
        .contains('host')
) {

    renderHostHome();

} else {

    renderProjector();

    createAdminButton();

}
