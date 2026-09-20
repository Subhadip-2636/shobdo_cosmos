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
// Only one SHOBDO writing can speak at a time.
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
// TEXT NORMALIZATION
// Preserve poem lines and stanza breaks.
// =========================================================

function normalizeSpeechText(
  value
) {

  return String(
    value || ""
  )
    .replace(
      /<br\s*\/?\s*>/gi,
      "\n"
    )
    .replace(
      /<\/(p|div|li|blockquote|h[1-6])>/gi,
      "\n"
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
      /\r\n?/g,
      "\n"
    )
    .split("\n")
    .map(
      (
        line
      ) =>
        line
          .replace(
            /[\t ]+/g,
            " "
          )
          .trim()
    )
    .join("\n")
    .replace(
      /\n{3,}/g,
      "\n\n"
    )
    .trim();
}


// =========================================================
// SPLIT A LONG SINGLE LINE WITHOUT DESTROYING POETRY
// =========================================================

function splitLongLine(
  text,
  maxLength = 220
) {

  const safeText =
    String(
      text || ""
    ).trim();


  if (!safeText) {
    return [];
  }


  if (
    safeText.length <=
    maxLength
  ) {

    return [
      safeText,
    ];
  }


  const parts = [];

  let cursor = 0;


  while (
    cursor < safeText.length
  ) {

    let end =
      Math.min(
        cursor + maxLength,
        safeText.length
      );


    if (
      end < safeText.length
    ) {

      const candidate =
        safeText.slice(
          cursor,
          end
        );


      const punctuationBreak =
        Math.max(
          candidate.lastIndexOf("।"),
          candidate.lastIndexOf("?"),
          candidate.lastIndexOf("!"),
          candidate.lastIndexOf("."),
          candidate.lastIndexOf(";"),
          candidate.lastIndexOf(",")
        );


      if (
        punctuationBreak >=
        Math.floor(
          maxLength * 0.5
        )
      ) {

        end =
          cursor +
          punctuationBreak +
          1;

      } else {

        const whitespaceBreak =
          candidate.lastIndexOf(
            " "
          );


        if (
          whitespaceBreak >=
          Math.floor(
            maxLength * 0.5
          )
        ) {

          end =
            cursor +
            whitespaceBreak;
        }
      }
    }


    const part =
      safeText
        .slice(
          cursor,
          end
        )
        .trim();


    if (part) {
      parts.push(
        part
      );
    }


    cursor =
      Math.max(
        end,
        cursor + 1
      );


    while (
      cursor < safeText.length &&
      /\s/.test(
        safeText[cursor]
      )
    ) {
      cursor += 1;
    }
  }


  return parts;
}


// =========================================================
// BUILD SPEECH PLAN
// Every poem line is its own logical speech unit.
// Blank lines create a longer stanza pause.
// =========================================================

function createSpeechPlan(
  title,
  content
) {

  const safeTitle =
    normalizeSpeechText(
      title
    )
      .replace(
        /\n+/g,
        " "
      )
      .trim();


  const safeContent =
    normalizeSpeechText(
      content
    );


  const rawChunks = [];


  if (safeTitle) {

    const titleParts =
      splitLongLine(
        safeTitle
      );


    titleParts.forEach(
      (
        part,
        index
      ) => {

        rawChunks.push({
          text:
            part,

          pauseMs:
            index ===
            titleParts.length - 1
              ? 420
              : 150,
        });
      }
    );
  }


  if (safeContent) {

    const lines =
      safeContent.split(
        "\n"
      );


    lines.forEach(
      (
        line
      ) => {

        const trimmed =
          line.trim();


        if (!trimmed) {

          const previous =
            rawChunks[
              rawChunks.length - 1
            ];


          if (previous) {

            previous.pauseMs =
              Math.max(
                previous.pauseMs || 0,
                560
              );
          }


          return;
        }


        const parts =
          splitLongLine(
            trimmed
          );


        parts.forEach(
          (
            part,
            index
          ) => {

            rawChunks.push({
              text:
                part,

              pauseMs:
                index ===
                parts.length - 1
                  ? 260
                  : 130,
            });
          }
        );
      }
    );
  }


  let totalCharacters =
    0;


  const chunks =
    rawChunks.map(
      (
        chunk,
        index
      ) => {

        const start =
          totalCharacters;


        totalCharacters +=
          chunk.text.length;


        const end =
          totalCharacters;


        return {
          ...chunk,

          index,

          start,

          end,
        };
      }
    );


  return {
    chunks,

    totalCharacters,
  };
}


// =========================================================
// SPEECH LANGUAGE
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
// WAIT FOR BROWSER VOICES
// Chrome often returns [] on the first getVoices() call.
// =========================================================

function waitForVoices(
  synthesis,
  timeout = 1400
) {

  const existing =
    synthesis.getVoices?.() ||
    [];


  if (
    existing.length > 0
  ) {

    return Promise.resolve(
      existing
    );
  }


  return new Promise(
    (
      resolve
    ) => {

      let finished =
        false;


      function finish() {

        if (finished) {
          return;
        }


        finished =
          true;


        synthesis.removeEventListener?.(
          "voiceschanged",
          handleVoicesChanged
        );


        resolve(
          synthesis.getVoices?.() ||
          []
        );
      }


      function handleVoicesChanged() {

        const voices =
          synthesis.getVoices?.() ||
          [];


        if (
          voices.length > 0
        ) {
          finish();
        }
      }


      synthesis.addEventListener?.(
        "voiceschanged",
        handleVoicesChanged
      );


      window.setTimeout(
        finish,
        timeout
      );
    }
  );
}


// =========================================================
// SELECT A LANGUAGE-COMPATIBLE VOICE
// Never silently read Bengali with an English voice.
// =========================================================

function chooseVoice(
  voices,
  locale
) {

  const safeVoices =
    Array.isArray(
      voices
    )
      ? voices
      : [];


  if (
    safeVoices.length === 0
  ) {
    return null;
  }


  const normalizedLocale =
    String(
      locale || ""
    ).toLowerCase();


  const baseLanguage =
    normalizedLocale
      .split("-")[0];


  const exact =
    safeVoices.find(
      (
        voice
      ) =>
        String(
          voice?.lang || ""
        ).toLowerCase() ===
        normalizedLocale
    );


  if (exact) {
    return exact;
  }


  const sameLanguage =
    safeVoices.find(
      (
        voice
      ) => {

        const voiceLanguage =
          String(
            voice?.lang || ""
          )
            .toLowerCase();


        return (
          voiceLanguage ===
            baseLanguage ||
          voiceLanguage.startsWith(
            `${baseLanguage}-`
          )
        );
      }
    );


  if (sameLanguage) {
    return sameLanguage;
  }


  // English can safely use another English/default voice.
  // Other languages must not silently fall back to English.
  if (
    baseLanguage === "en"
  ) {

    return (
      safeVoices.find(
        (
          voice
        ) =>
          Boolean(
            voice?.default
          )
      ) ||
      safeVoices[0] ||
      null
    );
  }


  return null;
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
    language:
      uiLanguage,
  } = useLanguage();


  // =======================================================
  // COPY
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

            preparing:
              "ভয়েস প্রস্তুত হচ্ছে",

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

            voiceUnavailable:
              "এই লেখার ভাষার জন্য আপনার ব্রাউজার বা ডিভাইসে উপযুক্ত ভয়েস পাওয়া যায়নি।",

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

            preparing:
              "आवाज़ तैयार हो रही है",

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

            voiceUnavailable:
              "इस रचना की भाषा के लिए आपके ब्राउज़र या डिवाइस पर उपयुक्त आवाज़ उपलब्ध नहीं है।",

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

          preparing:
            "Preparing voice",

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

          voiceUnavailable:
            "A compatible voice for this writing's language is not installed in your browser or device.",

          error:
            "Unable to play this writing",
        };

      },
      [
        uiLanguage,
      ]
    );


  // =======================================================
  // SPEECH PLAN
  // =======================================================

  const speechPlan =
    useMemo(
      () =>
        createSpeechPlan(
          title,
          content
        ),
      [
        title,
        content,
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

  const currentCharacterRef =
    useRef(
      0
    );


  const playbackIdRef =
    useRef(
      0
    );


  const pauseTimerRef =
    useRef(
      null
    );


  const rateRef =
    useRef(
      1
    );


  // =======================================================
  // DERIVED STATE
  // =======================================================

  const supported =
    typeof window !==
      "undefined" &&
    "speechSynthesis" in
      window &&
    "SpeechSynthesisUtterance" in
      window;


  const hasText =
    speechPlan.chunks.length > 0 &&
    speechPlan.totalCharacters > 0;


  const isPreparing =
    status ===
    "preparing";


  const isSpeaking =
    status ===
    "speaking";


  const isPaused =
    status ===
    "paused";


  const isActive =
    isPreparing ||
    isSpeaking ||
    isPaused;


  // =======================================================
  // KEEP RATE REF CURRENT
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
  // ONLY ONE WRITING AT A TIME
  // =======================================================

  useEffect(
    () => {

      function handleOwnerChange(
        event
      ) {

        const ownerId =
          event?.detail
            ?.ownerId;


        if (
          ownerId &&
          ownerId !==
            playerId
        ) {

          playbackIdRef.current +=
            1;


          if (
            pauseTimerRef.current
          ) {

            window.clearTimeout(
              pauseTimerRef.current
            );


            pauseTimerRef.current =
              null;
          }


          setStatus(
            "idle"
          );


          setProgress(
            0
          );


          setErrorMessage(
            ""
          );


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
  // RESET WHEN CARD CHANGES
  // =======================================================

  useEffect(
    () => {

      playbackIdRef.current +=
        1;


      if (
        pauseTimerRef.current
      ) {

        window.clearTimeout(
          pauseTimerRef.current
        );


        pauseTimerRef.current =
          null;
      }


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


      currentCharacterRef.current =
        0;

    },
    [
      writingId,
    ]
  );


  // =======================================================
  // CLEANUP
  // =======================================================

  useEffect(
    () => {

      return () => {

        playbackIdRef.current +=
          1;


        if (
          pauseTimerRef.current
        ) {

          window.clearTimeout(
            pauseTimerRef.current
          );
        }


        if (
          supported &&
          activeSpeechOwnerId ===
            playerId
        ) {

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
  // FIND POSITION IN SPEECH PLAN
  // =======================================================

  function findChunkPosition(
    characterIndex
  ) {

    const safeCharacter =
      Math.max(
        0,
        Math.min(
          Number(
            characterIndex
          ) || 0,
          speechPlan.totalCharacters
        )
      );


    let selectedIndex =
      0;


    for (
      let index = 0;
      index <
        speechPlan.chunks.length;
      index += 1
    ) {

      const chunk =
        speechPlan.chunks[
          index
        ];


      if (
        safeCharacter >=
          chunk.start &&
        safeCharacter <
          chunk.end
      ) {

        selectedIndex =
          index;

        break;
      }


      if (
        safeCharacter >=
        chunk.end
      ) {

        selectedIndex =
          Math.min(
            index + 1,
            speechPlan.chunks.length - 1
          );
      }
    }


    const chunk =
      speechPlan.chunks[
        selectedIndex
      ];


    return {
      chunkIndex:
        selectedIndex,

      offset:
        chunk
          ? Math.max(
              0,
              safeCharacter -
              chunk.start
            )
          : 0,
    };
  }


  // =======================================================
  // UPDATE PROGRESS
  // =======================================================

  function updateProgress(
    characterIndex
  ) {

    const safeCharacter =
      Math.max(
        0,
        Math.min(
          characterIndex,
          speechPlan.totalCharacters
        )
      );


    currentCharacterRef.current =
      safeCharacter;


    const percentage =
      speechPlan.totalCharacters > 0
        ? (
            safeCharacter /
            speechPlan.totalCharacters
          ) *
          100
        : 0;


    setProgress(
      Math.max(
        0,
        Math.min(
          100,
          percentage
        )
      )
    );
  }


  // =======================================================
  // SPEAK ONE CHUNK
  // =======================================================

  function speakChunk({
    chunkIndex,
    offset = 0,
    voice,
    selectedRate,
    playbackId,
  }) {

    if (
      !supported ||
      playbackId !==
        playbackIdRef.current ||
      activeSpeechOwnerId !==
        playerId
    ) {
      return;
    }


    const chunk =
      speechPlan.chunks[
        chunkIndex
      ];


    if (!chunk) {

      updateProgress(
        speechPlan.totalCharacters
      );


      setStatus(
        "idle"
      );


      activeSpeechOwnerId =
        null;


      return;
    }


    const safeOffset =
      Math.max(
        0,
        Math.min(
          offset,
          chunk.text.length
        )
      );


    const speechText =
      chunk.text
        .slice(
          safeOffset
        )
        .trim();


    if (!speechText) {

      updateProgress(
        chunk.end
      );


      speakChunk({
        chunkIndex:
          chunkIndex + 1,

        offset:
          0,

        voice,

        selectedRate,

        playbackId,
      });


      return;
    }


    const synthesis =
      window
        .speechSynthesis;


    const utterance =
      new window
        .SpeechSynthesisUtterance(
          speechText
        );


    utterance.lang =
      speechLocale;


    utterance.voice =
      voice;


    utterance.rate =
      selectedRate;


    utterance.pitch =
      1;


    utterance.volume =
      1;


    utterance.onstart =
      () => {

        if (
          playbackId !==
            playbackIdRef.current
        ) {
          return;
        }


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
          playbackId !==
            playbackIdRef.current ||
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


        updateProgress(
          Math.min(
            chunk.end,
            chunk.start +
              safeOffset +
              localIndex
          )
        );
      };


    utterance.onend =
      () => {

        if (
          playbackId !==
            playbackIdRef.current ||
          activeSpeechOwnerId !==
            playerId
        ) {
          return;
        }


        updateProgress(
          chunk.end
        );


        const nextChunkIndex =
          chunkIndex + 1;


        if (
          nextChunkIndex >=
          speechPlan.chunks.length
        ) {

          setProgress(
            100
          );


          currentCharacterRef.current =
            speechPlan.totalCharacters;


          setStatus(
            "idle"
          );


          activeSpeechOwnerId =
            null;


          return;
        }


        pauseTimerRef.current =
          window.setTimeout(
            () => {

              pauseTimerRef.current =
                null;


              if (
                playbackId !==
                  playbackIdRef.current ||
                activeSpeechOwnerId !==
                  playerId
              ) {
                return;
              }


              speakChunk({
                chunkIndex:
                  nextChunkIndex,

                offset:
                  0,

                voice,

                selectedRate,

                playbackId,
              });

            },
            chunk.pauseMs ||
              180
          );
      };


    utterance.onerror =
      (
        event
      ) => {

        if (
          playbackId !==
            playbackIdRef.current
        ) {
          return;
        }


        const error =
          String(
            event?.error ||
            ""
          );


        if (
          error === "canceled" ||
          error === "interrupted"
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
  // START / RESTART SPEECH
  // =======================================================

  async function startSpeech(
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


    playbackIdRef.current +=
      1;


    const playbackId =
      playbackIdRef.current;


    if (
      pauseTimerRef.current
    ) {

      window.clearTimeout(
        pauseTimerRef.current
      );


      pauseTimerRef.current =
        null;
    }


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


    setStatus(
      "preparing"
    );


    setErrorMessage(
      ""
    );


    const voices =
      await waitForVoices(
        synthesis
      );


    if (
      playbackId !==
        playbackIdRef.current ||
      activeSpeechOwnerId !==
        playerId
    ) {
      return;
    }


    const voice =
      chooseVoice(
        voices,
        speechLocale
      );


    if (!voice) {

      setStatus(
        "idle"
      );


      setErrorMessage(
        copy.voiceUnavailable
      );


      activeSpeechOwnerId =
        null;


      return;
    }


    const safeCharacter =
      Math.max(
        0,
        Math.min(
          Number(
            characterIndex
          ) || 0,
          speechPlan.totalCharacters
        )
      );


    updateProgress(
      safeCharacter
    );


    const {
      chunkIndex,
      offset,
    } = findChunkPosition(
      safeCharacter
    );


    speakChunk({
      chunkIndex,

      offset,

      voice,

      selectedRate,

      playbackId,
    });
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


    const startCharacter =
      progress >= 99.5
        ? 0
        : currentCharacterRef.current;


    if (
      startCharacter === 0
    ) {

      setProgress(
        0
      );
    }


    startSpeech(
      startCharacter
    );
  }


  // =======================================================
  // STOP
  // =======================================================

  function handleStop() {

    playbackIdRef.current +=
      1;


    if (
      pauseTimerRef.current
    ) {

      window.clearTimeout(
        pauseTimerRef.current
      );


      pauseTimerRef.current =
        null;
    }


    if (
      supported &&
      activeSpeechOwnerId ===
        playerId
    ) {

      window
        .speechSynthesis
        .cancel();


      activeSpeechOwnerId =
        null;
    }


    currentCharacterRef.current =
      0;


    setStatus(
      "idle"
    );


    setProgress(
      0
    );


    setErrorMessage(
      ""
    );
  }


  // =======================================================
  // RESTART
  // =======================================================

  function handleRestart() {

    currentCharacterRef.current =
      0;


    setProgress(
      0
    );


    startSpeech(
      0
    );
  }


  // =======================================================
  // CHANGE SPEED
  // =======================================================

  function handleRateChange() {

    const currentIndex =
      RATE_OPTIONS.indexOf(
        rate
      );


    const nextRate =
      RATE_OPTIONS[
        (
          currentIndex + 1
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
  // OPEN PLAYER
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
  // NOTHING TO READ
  // =======================================================

  if (!hasText) {
    return null;
  }


  // =======================================================
  // STATUS LABEL
  // =======================================================

  const statusLabel =
    isPreparing
      ? copy.preparing
      : isSpeaking
        ? copy.listening
        : isPaused
          ? copy.paused
          : copy.listen;


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

        isPreparing
          ? "is-preparing"
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
                {statusLabel}
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
                  !supported ||
                  isPreparing
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
                    {statusLabel}
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
                  !supported ||
                  isPreparing
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
                  !supported ||
                  isPreparing
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
                aria-live="polite"
              >
                {errorMessage}
              </p>

            )}

          </div>

        )}

    </section>
  );
}
