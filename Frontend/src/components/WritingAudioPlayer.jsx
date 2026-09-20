import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Square,
  Volume2,
} from "lucide-react";

import {
  useLanguage,
} from "../Language/LanguageContext";

import "./WritingAudioPlayer.css";


// =========================================================
// GLOBAL SPEECH OWNER
// Only one writing should speak at a time.
// =========================================================

let activeSpeechOwnerId = null;

const SPEECH_OWNER_EVENT =
  "shobdo:speech-owner-changed";


// =========================================================
// CONSTANTS
// =========================================================

const RATE_OPTIONS = [
  0.75,
  1,
  1.25,
  1.5,
];


const SPEECH_LANGUAGE_MAP = {
  bn: "bn-IN",
  en: "en-IN",
  hi: "hi-IN",
  as: "as-IN",
  or: "or-IN",
  ta: "ta-IN",
  te: "te-IN",
};


const WAVE_LEVELS = [
  8,
  15,
  11,
  20,
  13,
  24,
  17,
  10,
  21,
  14,
  25,
  16,
  11,
  19,
  13,
  22,
  12,
  17,
];


// =========================================================
// CLEAN TEXT
// =========================================================

function cleanText(
  value
) {

  return String(
    value || ""
  )
    .replace(
      /<[^>]*>/g,
      " "
    )
    .replace(
      /[`*_>#~]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


// =========================================================
// CREATE SPEECH TEXT
// =========================================================

function createSpeechText(
  title,
  content
) {

  const safeTitle =
    cleanText(
      title
    );


  const safeContent =
    cleanText(
      content
    );


  if (
    safeTitle &&
    safeContent
  ) {

    return (
      `${safeTitle}. ${safeContent}`
    );
  }


  return (
    safeContent ||
    safeTitle
  );
}


// =========================================================
// SPLIT LONG WRITINGS
// =========================================================

function createSpeechChunks(
  text,
  maxLength = 240
) {

  if (!text) {
    return [];
  }


  const chunks = [];

  let start = 0;


  while (
    start < text.length
  ) {

    let end =
      Math.min(
        start + maxLength,
        text.length
      );


    if (
      end < text.length
    ) {

      const section =
        text.slice(
          start,
          end
        );


      const breakPoints = [
        section.lastIndexOf("।"),
        section.lastIndexOf("."),
        section.lastIndexOf("?"),
        section.lastIndexOf("!"),
        section.lastIndexOf(","),
        section.lastIndexOf(" "),
      ];


      const bestBreak =
        Math.max(
          ...breakPoints
        );


      if (
        bestBreak >
        maxLength * 0.55
      ) {

        end =
          start +
          bestBreak +
          1;
      }
    }


    const chunk =
      text
        .slice(
          start,
          end
        )
        .trim();


    if (chunk) {

      chunks.push({
        text:
          chunk,

        start,
      });
    }


    start =
      end;
  }


  return chunks;
}


// =========================================================
// LANGUAGE
// =========================================================

function getSpeechLocale(
  languageCode
) {

  const code =
    String(
      languageCode || "en"
    )
      .trim()
      .toLowerCase();


  return (
    SPEECH_LANGUAGE_MAP[
      code
    ] ||
    code ||
    "en-IN"
  );
}


// =========================================================
// FIND VOICE
// =========================================================

function getBestVoice(
  synthesis,
  locale
) {

  const voices =
    synthesis.getVoices?.() ||
    [];


  if (
    voices.length === 0
  ) {
    return null;
  }


  const normalizedLocale =
    locale.toLowerCase();


  const exact =
    voices.find(
      (
        voice
      ) =>
        String(
          voice.lang || ""
        ).toLowerCase() ===
        normalizedLocale
    );


  if (exact) {
    return exact;
  }


  const baseLanguage =
    normalizedLocale
      .split("-")[0];


  return (
    voices.find(
      (
        voice
      ) =>
        String(
          voice.lang || ""
        )
          .toLowerCase()
          .startsWith(
            `${baseLanguage}-`
          )
    ) ||
    null
  );
}


// =========================================================
// COMPONENT
// =========================================================

export default function WritingAudioPlayer({
  writingId,
  title,
  content,
  writingLanguage = "en",
}) {

  const {
    language: uiLanguage,
  } = useLanguage();


  // =======================================================
  // TRANSLATED COPY
  // =======================================================

  const copy =
    useMemo(
      () => {

        if (
          uiLanguage === "bn"
        ) {

          return {
            listen:
              "শুনুন",

            listening:
              "শোনা হচ্ছে",

            paused:
              "বিরতিতে",

            play:
              "শুনতে শুরু করুন",

            pause:
              "বিরতি দিন",

            resume:
              "আবার শুনুন",

            restart:
              "শুরু থেকে শুনুন",

            stop:
              "বন্ধ করুন",

            speed:
              "গতি",

            collapse:
              "অডিও প্লেয়ার ছোট করুন",

            expand:
              "অডিও প্লেয়ার খুলুন",

            unsupported:
              "এই ব্রাউজারে অডিও রিডার সমর্থিত নয়",

            error:
              "অডিও চালানো যায়নি",
          };
        }


        if (
          uiLanguage === "hi"
        ) {

          return {
            listen:
              "सुनें",

            listening:
              "चल रहा है",

            paused:
              "रुका हुआ",

            play:
              "सुनना शुरू करें",

            pause:
              "रोकें",

            resume:
              "फिर चलाएँ",

            restart:
              "शुरू से चलाएँ",

            stop:
              "बंद करें",

            speed:
              "गति",

            collapse:
              "ऑडियो प्लेयर छोटा करें",

            expand:
              "ऑडियो प्लेयर खोलें",

            unsupported:
              "यह ब्राउज़र ऑडियो रीडर का समर्थन नहीं करता",

            error:
              "ऑडियो चलाया नहीं जा सका",
          };
        }


        return {
          listen:
            "Listen",

          listening:
            "Listening",

          paused:
            "Paused",

          play:
            "Start listening",

          pause:
            "Pause",

          resume:
            "Resume",

          restart:
            "Restart",

          stop:
            "Stop",

          speed:
            "Speed",

          collapse:
            "Collapse audio player",

          expand:
            "Open audio player",

          unsupported:
            "Audio reading is not supported in this browser",

          error:
            "Unable to play this writing",
        };

      },
      [
        uiLanguage,
      ]
    );


  // =======================================================
  // SPEECH DATA
  // =======================================================

  const speechText =
    useMemo(
      () =>
        createSpeechText(
          title,
          content
        ),
      [
        title,
        content,
      ]
    );


  const speechChunks =
    useMemo(
      () =>
        createSpeechChunks(
          speechText
        ),
      [
        speechText,
      ]
    );


  const speechLocale =
    useMemo(
      () =>
        getSpeechLocale(
          writingLanguage
        ),
      [
        writingLanguage,
      ]
    );


  const playerId =
    useMemo(
      () =>
        `shobdo-writing-audio-${writingId}`,
      [
        writingId,
      ]
    );


  // =======================================================
  // STATE
  // =======================================================

  const [
    expanded,
    setExpanded,
  ] = useState(
    false
  );


  const [
    status,
    setStatus,
  ] = useState(
    "idle"
  );


  const [
    progress,
    setProgress,
  ] = useState(
    0
  );


  const [
    rate,
    setRate,
  ] = useState(
    1
  );


  const [
    errorMessage,
    setErrorMessage,
  ] = useState(
    ""
  );


  // =======================================================
  // REFS
  // =======================================================

  const currentChunkRef =
    useRef(
      0
    );


  const currentCharacterRef =
    useRef(
      0
    );


  const cancelReasonRef =
    useRef(
      ""
    );


  const startTimerRef =
    useRef(
      null
    );


  const rateRef =
    useRef(
      1
    );


  // =======================================================
  // SUPPORT
  // =======================================================

  const supported =
    typeof window !==
      "undefined" &&
    "speechSynthesis" in
      window &&
    "SpeechSynthesisUtterance" in
      window;


  const hasText =
    speechText.length >
      0 &&
    speechChunks.length >
      0;


  const isSpeaking =
    status ===
    "speaking";


  const isPaused =
    status ===
    "paused";


  const isActive =
    isSpeaking ||
    isPaused;


  // =======================================================
  // SYNC RATE
  // =======================================================

  useEffect(
    () => {

      rateRef.current =
        rate;

    },
    [
      rate,
    ]
  );


  // =======================================================
  // ONLY ONE PLAYER ACTIVE
  // =======================================================

  useEffect(
    () => {

      function handleOwnerChange(
        event
      ) {

        const owner =
          event?.detail
            ?.ownerId;


        if (
          owner &&
          owner !==
            playerId
        ) {

          setStatus(
            "idle"
          );

          setProgress(
            0
          );

          currentChunkRef.current =
            0;

          currentCharacterRef.current =
            0;
        }
      }


      window.addEventListener(
        SPEECH_OWNER_EVENT,
        handleOwnerChange
      );


      return () => {

        window.removeEventListener(
          SPEECH_OWNER_EVENT,
          handleOwnerChange
        );
      };

    },
    [
      playerId,
    ]
  );


  // =======================================================
  // CLEANUP
  // =======================================================

  useEffect(
    () => {

      return () => {

        if (
          startTimerRef.current
        ) {

          window.clearTimeout(
            startTimerRef.current
          );
        }


        if (
          supported &&
          activeSpeechOwnerId ===
            playerId
        ) {

          cancelReasonRef.current =
            "unmount";

          window
            .speechSynthesis
            .cancel();


          activeSpeechOwnerId =
            null;
        }
      };

    },
    [
      playerId,
      supported,
    ]
  );


  // =======================================================
  // RESET WHEN CARD CHANGES
  // =======================================================

  useEffect(
    () => {

      setExpanded(
        false
      );

      setStatus(
        "idle"
      );

      setProgress(
        0
      );

      setErrorMessage(
        ""
      );


      currentChunkRef.current =
        0;

      currentCharacterRef.current =
        0;

    },
    [
      writingId,
    ]
  );


  // =======================================================
  // FIND CHUNK
  // =======================================================

  function findChunkIndex(
    characterIndex
  ) {

    let result =
      0;


    speechChunks.forEach(
      (
        chunk,
        index
      ) => {

        if (
          chunk.start <=
          characterIndex
        ) {

          result =
            index;
        }
      }
    );


    return result;
  }


  // =======================================================
  // SPEAK CHUNK
  // =======================================================

  function speakChunk(
    chunkIndex,
    startCharacter = null,
    selectedRate = rateRef.current
  ) {

    if (
      !supported ||
      !hasText
    ) {
      return;
    }


    const chunk =
      speechChunks[
        chunkIndex
      ];


    if (!chunk) {

      setStatus(
        "idle"
      );

      setProgress(
        100
      );


      activeSpeechOwnerId =
        null;


      return;
    }


    const start =
      Number.isFinite(
        Number(
          startCharacter
        )
      )
        ? Math.max(
            chunk.start,
            Number(
              startCharacter
            )
          )
        : chunk.start;


    const offset =
      Math.max(
        0,
        start -
          chunk.start
      );


    const text =
      chunk.text
        .slice(
          offset
        )
        .trim();


    if (!text) {

      speakChunk(
        chunkIndex + 1,
        null,
        selectedRate
      );

      return;
    }


    currentChunkRef.current =
      chunkIndex;


    const synthesis =
      window
        .speechSynthesis;


    const utterance =
      new window
        .SpeechSynthesisUtterance(
          text
        );


    utterance.lang =
      speechLocale;


    utterance.rate =
      selectedRate;


    utterance.pitch =
      1;


    utterance.volume =
      1;


    const voice =
      getBestVoice(
        synthesis,
        speechLocale
      );


    if (voice) {

      utterance.voice =
        voice;
    }


    utterance.onstart =
      () => {

        cancelReasonRef.current =
          "";

        setStatus(
          "speaking"
        );

        setErrorMessage(
          ""
        );
      };


    utterance.onboundary =
      (
        event
      ) => {

        if (
          activeSpeechOwnerId !==
          playerId
        ) {
          return;
        }


        const localIndex =
          Number(
            event?.charIndex ||
            0
          );


        const absoluteIndex =
          Math.min(
            speechText.length,
            start +
              localIndex
          );


        currentCharacterRef.current =
          absoluteIndex;


        const percentage =
          speechText.length
            ? (
                absoluteIndex /
                speechText.length
              ) *
              100
            : 0;


        setProgress(
          Math.min(
            100,
            Math.max(
              0,
              percentage
            )
          )
        );
      };


    utterance.onend =
      () => {

        if (
          activeSpeechOwnerId !==
          playerId
        ) {
          return;
        }


        if (
          cancelReasonRef.current
        ) {
          return;
        }


        const nextChunk =
          chunkIndex +
          1;


        if (
          nextChunk <
          speechChunks.length
        ) {

          currentCharacterRef.current =
            speechChunks[
              nextChunk
            ].start;


          speakChunk(
            nextChunk,
            null,
            selectedRate
          );


          return;
        }


        currentCharacterRef.current =
          speechText.length;


        setProgress(
          100
        );


        setStatus(
          "idle"
        );


        activeSpeechOwnerId =
          null;
      };


    utterance.onerror =
      (
        event
      ) => {

        const error =
          String(
            event?.error ||
            ""
          );


        if (
          cancelReasonRef.current ||
          error ===
            "canceled" ||
          error ===
            "interrupted"
        ) {

          return;
        }


        setStatus(
          "idle"
        );


        setErrorMessage(
          copy.error
        );


        if (
          activeSpeechOwnerId ===
          playerId
        ) {

          activeSpeechOwnerId =
            null;
        }
      };


    synthesis.speak(
      utterance
    );
  }


  // =======================================================
  // START SPEECH
  // =======================================================

  function startSpeech(
    characterIndex = 0,
    selectedRate = rateRef.current
  ) {

    if (
      !supported ||
      !hasText
    ) {
      return;
    }


    const synthesis =
      window
        .speechSynthesis;


    if (
      startTimerRef.current
    ) {

      window.clearTimeout(
        startTimerRef.current
      );
    }


    cancelReasonRef.current =
      "restart";


    synthesis.cancel();


    activeSpeechOwnerId =
      playerId;


    window.dispatchEvent(
      new CustomEvent(
        SPEECH_OWNER_EVENT,
        {
          detail: {
            ownerId:
              playerId,
          },
        }
      )
    );


    const safeIndex =
      Math.min(
        Math.max(
          0,
          characterIndex
        ),
        speechText.length
      );


    currentCharacterRef.current =
      safeIndex;


    const chunkIndex =
      findChunkIndex(
        safeIndex
      );


    startTimerRef.current =
      window.setTimeout(
        () => {

          cancelReasonRef.current =
            "";


          speakChunk(
            chunkIndex,
            safeIndex,
            selectedRate
          );


          startTimerRef.current =
            null;

        },
        70
      );
  }


  // =======================================================
  // PLAY / PAUSE
  // =======================================================

  function handlePlayPause() {

    if (
      !supported ||
      !hasText
    ) {
      return;
    }


    const synthesis =
      window
        .speechSynthesis;


    if (
      isSpeaking &&
      activeSpeechOwnerId ===
        playerId
    ) {

      synthesis.pause();


      setStatus(
        "paused"
      );


      return;
    }


    if (
      isPaused &&
      activeSpeechOwnerId ===
        playerId
    ) {

      synthesis.resume();


      setStatus(
        "speaking"
      );


      return;
    }


    const start =
      progress >=
      99.5
        ? 0
        : currentCharacterRef.current;


    if (
      start === 0
    ) {

      setProgress(
        0
      );
    }


    startSpeech(
      start
    );
  }


  // =======================================================
  // STOP
  // =======================================================

  function handleStop() {

    if (
      !supported
    ) {
      return;
    }


    cancelReasonRef.current =
      "stop";


    if (
      startTimerRef.current
    ) {

      window.clearTimeout(
        startTimerRef.current
      );

      startTimerRef.current =
        null;
    }


    if (
      activeSpeechOwnerId ===
      playerId
    ) {

      window
        .speechSynthesis
        .cancel();


      activeSpeechOwnerId =
        null;
    }


    currentChunkRef.current =
      0;


    currentCharacterRef.current =
      0;


    setStatus(
      "idle"
    );


    setProgress(
      0
    );
  }


  // =======================================================
  // RESTART
  // =======================================================

  function handleRestart() {

    setProgress(
      0
    );


    currentCharacterRef.current =
      0;


    startSpeech(
      0
    );
  }


  // =======================================================
  // CHANGE SPEED
  // =======================================================

  function handleRateChange() {

    const index =
      RATE_OPTIONS.indexOf(
        rate
      );


    const nextRate =
      RATE_OPTIONS[
        (
          index + 1
        ) %
        RATE_OPTIONS.length
      ];


    setRate(
      nextRate
    );


    rateRef.current =
      nextRate;


    if (
      isActive &&
      activeSpeechOwnerId ===
        playerId
    ) {

      startSpeech(
        currentCharacterRef.current,
        nextRate
      );
    }
  }


  // =======================================================
  // COLLAPSED BUTTON
  // =======================================================

  function handleOpenPlayer() {

    setExpanded(
      true
    );


    if (
      !isActive
    ) {

      handlePlayPause();
    }
  }


  // =======================================================
  // NO TEXT
  // =======================================================

  if (
    !hasText
  ) {

    return null;
  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <section
      className={[
        "writing-audio-player",

        expanded
          ? "expanded"
          : "collapsed",

        isSpeaking
          ? "is-speaking"
          : "",

        isPaused
          ? "is-paused"
          : "",

      ]
        .filter(Boolean)
        .join(" ")
      }
      aria-label={
        copy.listen
      }
    >

      {!expanded
        ? (

          <button
            type="button"
            className="writing-audio-collapsed-button"
            onClick={
              handleOpenPlayer
            }
            disabled={
              !supported
            }
            title={
              supported
                ? copy.listen
                : copy.unsupported
            }
            aria-label={
              supported
                ? copy.expand
                : copy.unsupported
            }
          >

            <span
              className="writing-audio-icon"
              aria-hidden="true"
            >

              <Headphones
                size={17}
              />

            </span>


            <span
              className="writing-audio-collapsed-copy"
            >

              <strong>
                {
                  isSpeaking
                    ? copy.listening
                    : isPaused
                      ? copy.paused
                      : copy.listen
                }
              </strong>


              {progress > 0 && (

                <span>
                  {Math.round(
                    progress
                  )}%
                </span>

              )}

            </span>


            <span
              className="writing-audio-mini-wave"
              aria-hidden="true"
            >

              {WAVE_LEVELS
                .slice(
                  0,
                  10
                )
                .map(
                  (
                    level,
                    index
                  ) => (

                    <span
                      key={
                        `${level}-${index}`
                      }
                      style={{
                        "--wave-level":
                          `${Math.max(
                            4,
                            Math.round(
                              level *
                              0.62
                            )
                          )}px`,

                        "--wave-index":
                          index,
                      }}
                    />

                  )
                )}

            </span>


            <ChevronDown
              size={16}
              aria-hidden="true"
            />

          </button>

        )
        : (

          <div
            className="writing-audio-expanded-shell"
          >

            <div
              className="writing-audio-top-row"
            >

              <button
                type="button"
                className="writing-audio-primary-button"
                onClick={
                  handlePlayPause
                }
                disabled={
                  !supported
                }
                title={
                  isSpeaking
                    ? copy.pause
                    : isPaused
                      ? copy.resume
                      : copy.play
                }
                aria-label={
                  isSpeaking
                    ? copy.pause
                    : isPaused
                      ? copy.resume
                      : copy.play
                }
              >

                {isSpeaking
                  ? (

                    <Pause
                      size={18}
                      fill="currentColor"
                    />

                  )
                  : (

                    <Play
                      size={18}
                      fill="currentColor"
                    />

                  )}

              </button>


              <div
                className="writing-audio-status"
              >

                <span
                  className="writing-audio-status-title"
                >

                  <Volume2
                    size={15}
                  />

                  <strong>
                    {
                      isSpeaking
                        ? copy.listening
                        : isPaused
                          ? copy.paused
                          : copy.listen
                    }
                  </strong>

                </span>


                <div
                  className="writing-audio-visualizer"
                  aria-hidden="true"
                >

                  {WAVE_LEVELS.map(
                    (
                      level,
                      index
                    ) => (

                      <span
                        key={
                          `${level}-${index}`
                        }
                        style={{
                          "--wave-level":
                            `${level}px`,

                          "--wave-index":
                            index,
                        }}
                      />

                    )
                  )}

                </div>

              </div>


              <button
                type="button"
                className="writing-audio-collapse-button"
                onClick={
                  () =>
                    setExpanded(
                      false
                    )
                }
                title={
                  copy.collapse
                }
                aria-label={
                  copy.collapse
                }
              >

                <ChevronUp
                  size={17}
                />

              </button>

            </div>


            <div
              className="writing-audio-progress-row"
            >

              <div
                className="writing-audio-progress-track"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={
                  Math.round(
                    progress
                  )
                }
              >

                <span
                  className="writing-audio-progress-fill"
                  style={{
                    width:
                      `${Math.min(
                        100,
                        Math.max(
                          0,
                          progress
                        )
                      )}%`,
                  }}
                />

              </div>


              <span
                className="writing-audio-progress-value"
              >
                {Math.round(
                  progress
                )}%
              </span>

            </div>


            <div
              className="writing-audio-controls"
            >

              <button
                type="button"
                onClick={
                  handleRestart
                }
                disabled={
                  !supported
                }
                title={
                  copy.restart
                }
                aria-label={
                  copy.restart
                }
              >

                <RotateCcw
                  size={15}
                />

              </button>


              <button
                type="button"
                className="writing-audio-rate-button"
                onClick={
                  handleRateChange
                }
                disabled={
                  !supported
                }
                title={
                  `${copy.speed}: ${rate}×`
                }
                aria-label={
                  `${copy.speed}: ${rate}×`
                }
              >

                {rate}×

              </button>


              <button
                type="button"
                onClick={
                  handleStop
                }
                disabled={
                  !supported ||
                  !isActive
                }
                title={
                  copy.stop
                }
                aria-label={
                  copy.stop
                }
              >

                <Square
                  size={14}
                  fill="currentColor"
                />

              </button>

            </div>


            {!supported && (

              <p
                className="writing-audio-message"
              >
                {copy.unsupported}
              </p>

            )}


            {errorMessage && (

              <p
                className="writing-audio-message error"
                role="status"
              >
                {errorMessage}
              </p>

            )}

          </div>

        )}

    </section>
  );
}